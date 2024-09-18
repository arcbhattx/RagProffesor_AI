'use client'

import { Box, Button, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleSignUpClick = () => {
    router.push('/signUp') // Navigate to the sign-up page
  }

  const handleSignInClick = () => {
    router.push('/signIn') // Navigate to the sign-in page
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ bgcolor: 'black' }}
    >

      <Box
        sx={{
          display: 'flex',  // Enables flexbox layout
          alignItems: 'center',  // Optional: Vertically aligns images
          justifyContent: 'center',  // Optional: Horizontally centers the images
          gap: 2  // Adds some space between the images
        }}
      >
        <Box
          component="img"
          sx={{
            width: '5%',  // Set width to your desired size
            height: 'auto', // Maintains aspect ratio
            borderRadius: '8px', // Optional: adds rounded corners
            boxShadow: 3 // Optional: adds shadow
          }}
          alt="Your image description"
          src="/images/openai.png"  // Add your image path here
        />

        <Box
          component="img"
          sx={{
            width: '10%',  // Set width to your desired size
            height: 'auto', // Maintains aspect ratio
            borderRadius: '8px', // Optional: adds rounded corners
            boxShadow: 3 // Optional: adds shadow
          }}
          alt="Your image description"
          src="/images/pinecone.jpeg"  // Add your image path here
        />
      </Box>

      <Stack
        direction="column"
        spacing={5}
        alignItems="center"
      >
        <Typography color="blue" variant="" component="h1">
          WELCOME TO RAGPROFFESOR
        </Typography>

        <Typography color="white" variant="p" component="p">
          A rag application using pinecone vector database and open ai to give you the best
        </Typography>

        <Typography color="white" variant="p" component="p">
          results of &apos;rate my Proffesor&apos; through user queries.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            sx={{
              bgcolor: 'black',
              ':hover': { bgcolor: 'blue' },
              border: '1px solid white'  // Add the border inside the sx prop
            }}
            variant="contained"
            onClick={handleSignUpClick}
          >
            Sign Up
          </Button>
          <Button
            sx={{
              bgcolor: 'black',
              ':hover': { bgcolor: 'blue' },
              border: '1px solid white'  // Add the border inside the sx prop
            }}
            variant="contained"
            onClick={handleSignInClick}
          >
            Sign In
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
