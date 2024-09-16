'use client'
import { Box, Button, Stack, TextField, AppBar, Toolbar, Typography, Modal } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the path as necessary
import { useAuth } from './context/AuthContext'; 

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. Enter in your desired query and I will provide you with proffesor information`,
    },
  ])
  const { user } = useAuth(); 
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true); 
  const [open, setOpen] = useState(false); // Modal state
  const [link, setLink] = useState(''); // To store professor link
  const router = useRouter()

  const [loadingModal, setLoadingModal] = useState(false);  


  useEffect(() => {
    if (user === undefined) {
      return;
    }
    if (user === null) {
      router.push('/home');
    } else {
      setLoading(false); 
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
    ])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          const bubbles = result.split('\n\n').filter((bubble) => bubble.trim())
          setMessages((messages) => [
            ...messages,
            ...bubbles.map((bubble) => ({
              role: 'assistant',
              content: bubble,
            })),
          ])
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        result += text
        return reader.read().then(processText)
      })
    })
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/home');  
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHome = () => {
    router.push('/home')
  }

  const handleAddLink = async () => {
    setLoadingModal(true);
    try {
      // Send the link to your backend API for processing
      const response = await fetch('/api/process-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link }),
      });

      if (response.ok) {
        console.log('Link processed successfully');
      } else {
        console.error('Error processing link');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingModal(false);
      setOpen(false); // Close the modal after processing
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"  
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: 'black' }}
    >
      <Stack
        direction={'column'}
        width="1200px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <AppBar position="static" 
          sx={{ 
            backgroundColor: 'darkblue'  // Use your custom color code here
          }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white'}}>
              Chat With Professor Vector!
            </Typography>
            <Button color="inherit" onClick={handleHome}>
              Home
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
            <Button color="inherit" onClick={() => setOpen(true)}>
              Add Rate My Proffesor Link
            </Button>
          </Toolbar>
        </AppBar>

        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'blue'
                    : 'purple'
                }
                color="white"
                borderRadius={8} 
                p={2} 
                m={1}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { color: 'white' }, 
            }}
            InputLabelProps={{
              style: { color: 'white' }, 
            }}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>

      {/* Add Link Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={4}
          sx={{ backgroundColor: 'white', margin: 'auto', mt: 10, width: 400 }}
        >
          <Typography variant="h6" color="black">Add Rate My Professor Link</Typography>

          <TextField
            label="Professor's Link"
            fullWidth
            value={link}
            onChange={(e) => setLink(e.target.value)}
            sx={{ mt: 2 }}
          />

         
            <Button variant="contained" onClick={handleAddLink} sx={{ mt: 2 }}>
              Submit
            </Button>
        </Box>
      </Modal>
    </Box>
  )
}
