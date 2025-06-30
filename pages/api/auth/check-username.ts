import { NextApiRequest, NextApiResponse } from 'next';

// Mock database of existing usernames for development
const MOCK_EXISTING_USERNAMES = [
  'admin',
  'user',
  'test',
  'demo',
  'john',
  'jane',
  'smith',
  'MaiAn',
  'MaiAn1',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed',
      available: false
    });
  }

  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ 
      success: false,
      message: 'Username is required',
      available: false
    });
  }

  try {
    console.log('Checking username availability for:', username);
    
    // Using mock database for development
    // In production, this would use a real database query
    const isAvailable = !MOCK_EXISTING_USERNAMES.includes(username);
    
    console.log('Username check result:', { username, isAvailable });
    
    // Add a small delay to simulate network latency (optional)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return res.status(200).json({ 
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Error checking username:', error);
    
    // Provide a user-friendly error message
    return res.status(500).json({ 
      success: false,
      message: 'Unable to check username availability. Please try again later.',
      available: false,
      // Only include detailed error info in development
      ...(process.env.NODE_ENV === 'development' && { debug: (error as Error).message })
    });
  }
}
