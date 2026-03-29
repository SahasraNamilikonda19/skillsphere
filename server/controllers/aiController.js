const Groq = require('groq-sdk');
const User = require('../models/User');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// @route  POST /api/ai/chat
// @access Private
const chat = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Fetch top users to give AI context
    const topUsers = await User.find({ isActive: true })
      .select('name bio skillsToTeach skillsToLearn points rating')
      .sort({ points: -1 })
      .limit(5);

    const usersContext = topUsers.map(u => ({
      name:         u.name,
      teaches:      u.skillsToTeach.map(s => s.name).join(', ') || 'No skills listed',
      wantsToLearn: u.skillsToLearn.map(s => s.name).join(', ') || 'None',
      points:       u.points,
      rating:       u.rating?.toFixed(1) || '0.0'
    }));

    // System prompt
    const systemPrompt = `You are SkillSphere AI Assistant — a helpful friendly assistant built into the SkillSphere peer learning platform.

About SkillSphere:
- Users teach skills they know and learn skills they want
- Users book real-time sessions with peer instructors
- After sessions instructors assign quizzes to learners
- Users earn points and badges for teaching learning and passing quizzes
- There is a leaderboard showing top contributors

Current top users: ${JSON.stringify(usersContext)}

Current user: ${req.user.name}

Rules:
- Be friendly and concise
- Recommend peers by name when asked about a skill
- Keep responses under 120 words
- Use emojis occasionally`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-6), // last 6 messages for context
      { role: 'user', content: message }
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      messages,
      max_tokens:  300,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry I could not generate a response.';

    res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('AI Error:', error.message);

    if (error.message?.includes('401') || error.message?.includes('invalid_api_key')) {
      return res.status(500).json({
        success: false,
        message: 'Invalid Groq API key. Check your GROQ_API_KEY in .env'
      });
    }

    if (error.message?.includes('429') || error.message?.includes('rate_limit')) {
      return res.status(500).json({
        success: false,
        message: 'Too many requests. Please wait a moment and try again.'
      });
    }

    next(error);
  }
};

module.exports = { chat };