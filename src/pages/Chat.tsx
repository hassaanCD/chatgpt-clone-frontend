import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
}

const Chat = () => {
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      loadChats()
    }
  }, [isAuthenticated, navigate])

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chat')
      setChats(response.data)
      if (response.data.length > 0) {
        setCurrentChat(response.data[0])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      const response = await axios.post('/api/chat/message', {
        chatId: currentChat?.id,
        message,
      })

      if (!currentChat) {
        setCurrentChat(response.data)
        setChats([response.data, ...chats])
      } else {
        const updatedChat = response.data
        setCurrentChat(updatedChat)
        setChats(chats.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        ))
      }
      setMessage('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box h="100vh" display="flex">
      <Box w="250px" bg="gray.100" p={4} overflowY="auto">
        <VStack spacing={4} align="stretch">
          <Button colorScheme="blue" onClick={() => setCurrentChat(null)}>
            New Chat
          </Button>
          {chats.map(chat => (
            <HStack
              key={chat.id}
              p={2}
              bg={currentChat?.id === chat.id ? 'blue.100' : 'transparent'}
              borderRadius="md"
              cursor="pointer"
              onClick={() => setCurrentChat(chat)}
            >
              <Text noOfLines={1}>{chat.title}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Box flex={1} display="flex" flexDirection="column">
        <Box p={4} bg="white" boxShadow="sm">
          <IconButton
            aria-label="Menu"
            icon={<HamburgerIcon />}
            display={{ base: 'block', md: 'none' }}
          />
        </Box>

        <VStack flex={1} p={4} spacing={4} overflowY="auto">
          {currentChat?.messages.map((msg, index) => (
            <Box
              key={index}
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              bg={msg.role === 'user' ? 'blue.500' : 'gray.200'}
              color={msg.role === 'user' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              <Text>{msg.content}</Text>
            </Box>
          ))}
        </VStack>

        <Box p={4} borderTop="1px" borderColor="gray.200">
          <HStack>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              colorScheme="blue"
              onClick={sendMessage}
              isLoading={isLoading}
            >
              Send
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}

export default Chat 