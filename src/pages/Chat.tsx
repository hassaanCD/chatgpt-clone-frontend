import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  List,
  ListItem,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  _id: string
  title: string
  messages: Message[]
}

const Chat = () => {
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchChats()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chat')
      setChats(response.data)
      if (response.data.length > 0 && !currentChat) {
        setCurrentChat(response.data[0])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chats',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const createNewChat = async () => {
    try {
      const response = await axios.post('/chat')
      const newChat = response.data
      setChats([newChat, ...chats])
      setCurrentChat(newChat)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChat) return

    setIsLoading(true)
    const userMessage = message
    setMessage('')

    try {
      const response = await axios.post(
        `/chat/${currentChat._id}/messages`,
        { message: userMessage }
      )
      setCurrentChat(response.data)
      setChats(chats.map(chat => 
        chat._id === response.data._id ? response.data : chat
      ))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box h="100vh" display="flex">
      {/* Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack justify="space-between">
              <Text>Chats</Text>
              <Button onClick={createNewChat} size="sm">
                New Chat
              </Button>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <List spacing={2}>
              {chats.map(chat => (
                <ListItem
                  key={chat._id}
                  p={2}
                  borderRadius="md"
                  bg={currentChat?._id === chat._id ? 'gray.100' : 'transparent'}
                  cursor="pointer"
                  onClick={() => {
                    setCurrentChat(chat)
                    onClose()
                  }}
                >
                  <Text noOfLines={1}>{chat.title}</Text>
                </ListItem>
              ))}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column">
        {/* Header */}
        <HStack p={4} borderBottomWidth={1} justify="space-between">
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
          />
          <Button onClick={handleLogout}>Logout</Button>
        </HStack>

        {/* Messages */}
        <Box flex={1} overflowY="auto" p={4}>
          <VStack spacing={4} align="stretch">
            {currentChat?.messages.map((msg, index) => (
              <Box
                key={index}
                p={4}
                borderRadius="md"
                bg={msg.role === 'user' ? 'blue.50' : 'gray.50'}
                alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="80%"
              >
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Input */}
        <Box p={4} borderTopWidth={1}>
          <HStack>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
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