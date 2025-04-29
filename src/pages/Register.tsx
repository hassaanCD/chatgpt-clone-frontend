import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(username, email, password)
      navigate('/chat')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Registration failed. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box w="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center">Register</Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Register
              </Button>
            </VStack>
          </form>
          <Text textAlign="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'blue' }}>
              Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

export default Register 