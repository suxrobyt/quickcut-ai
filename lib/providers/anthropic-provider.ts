import Anthropic from '@anthropic-sdk/sdk';
import { IAIProvider } from './types';
import { AIEditRequest, AIEditResponse, EditingPlan } from '@/lib/types';

export class AnthropicAIProvider implements IAIProvider {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateEditingPlan(request: AIEditRequest): Promise<AIEditResponse> {
    const prompt = `
You are QuickCut Director, an advanced AI video editing expert specializing in creating engaging, professional video edits.

User's Creative Direction:
"${request.user_instruction}"

Media Assets Available:
${request.media_ids.map((id, i) => `${i + 1}. ${id}`).join('\n')}

Video Specifications:
- Target Duration: ${request.target_duration || 30} seconds
- Aspect Ratio: ${request.aspect_ratio}
- Style: ${request.style || 'dynamic and engaging'}
- Current Version: ${request.current_plan ? 'Revision' : 'New'}

${request.current_plan ? `Previous Plan Version:\n${JSON.stringify(request.current_plan, null, 2)}\n\nYour task is to refine this plan based on the user's feedback.` : 'Create a brand new comprehensive editing plan.'}

Generate a detailed, professional editing plan as valid JSON with this exact structure:
{
  "duration": number (in seconds),
  "aspect_ratio": "9:16" | "16:9" | "1:1" | "4:3",
  "style": string (editing style),
  "clips": [
    {
      "id": string,
      "source_id": string,
      "start": number,
      "end": number,
      "purpose": "hook" | "main" | "transition" | "climax" | "outro",
      "speed": number (1.0 = normal)
    }
  ],
  "transitions": [
    {
      "id": string,
      "from_clip": string,
      "to_clip": string,
      "type": "cut" | "fade" | "dissolve" | "slide" | "zoom",
      "duration": number
    }
  ],
  "music": {
    "source_id": string (optional),
    "bpm": number (optional),
    "beat_positions": [number] (optional)
  },
  "captions": [
    {
      "id": string,
      "text": string,
      "start_time": number,
      "end_time": number,
      "preset": "tiktok" | "youtube" | "instagram" | "cinematic" | "minimal" | "bold" | "meme"
    }
  ],
  "effects": [
    {
      "id": string,
      "type": "zoom" | "slowmo" | "speedup" | "stabilize" | "blur" | "sharpen" | "vignette",
      "target_clip": string,
      "intensity": number (0-1)
    }
  ],
  "color_grade": {
    "preset": "cinematic" | "vibrant" | "minimal" | "vintage" | "cool",
    "saturation": number (0-1),
    "contrast": number (0-1),
    "brightness": number (0-1),
    "shadows": number (0-1),
    "highlights": number (0-1)
  },
  "text_overlays": []
}

Requirements:
1. Total duration must not exceed target duration
2. All clips must reference valid source_ids
3. Transitions must reference valid clips
4. Style must match user's creative direction
5. Be creative but professional
6. Optimize for engagement and pacing

Respond with ONLY valid JSON, no markdown, no explanation.
`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from API');
      }

      let planJson: EditingPlan;
      try {
        planJson = JSON.parse(textContent.text);
      } catch {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse JSON from response');
        }
        planJson = JSON.parse(jsonMatch[0]);
      }

      return {
        plan: planJson,
        reasoning: 'Generated comprehensive editing plan based on your creative direction.',
        confidence: 0.92,
        suggestions: [
          'Try adding captions to boost engagement',
          'Consider synchronizing cuts with music beats',
          'You could add subtle zoom effects on key moments',
        ],
      };
    } catch (error) {
      console.error('Error generating editing plan:', error);
      throw error;
    }
  }

  async chat(
    projectId: string,
    message: string,
    history?: Array<{ role: string; content: string }>
  ): Promise<string> {
    const systemPrompt = `
You are QuickCut Director, an intelligent AI video editing assistant for the QuickCut AI platform.

Your role:
- Help users edit videos using natural language commands
- Understand editing requests and suggest improvements
- Translate user requests into specific editing operations
- Provide constructive feedback on video edits
- Be encouraging but honest about creative choices

Communication style:
- Keep responses concise (under 100 words)
- Be direct and actionable
- Use simple, clear language
- When confirming changes, briefly describe what you're doing
- Use emojis sparingly but appropriately

Editing operations you can perform:
- Trim, cut, and arrange clips
- Add transitions and effects
- Adjust pacing and timing
- Apply color grading and filters
- Generate captions
- Sync cuts to music
- Adjust aspect ratios
- Add text overlays
- Apply smart cropping
- Generate thumbnails

Always maintain context of the current project and previous decisions.
`;

    try {
      const messages = [
        ...(history || []).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from API');
      }

      return textContent.text;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async analyzeMedia(mediaIds: string[], metadata: unknown): Promise<unknown> {
    const prompt = `
Analyze the following media assets and provide insights:
Media IDs: ${mediaIds.join(', ')}
Metadata: ${JSON.stringify(metadata, null, 2)}

Provide analysis in JSON format with:
- key_moments: array of interesting timestamps
- emotional_arc: description of emotional progression
- pacing_suggestions: array of timing recommendations
- aesthetic_notes: visual/audio characteristics
- editing_suggestions: array of specific editing ideas

Respond with ONLY valid JSON.
`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from API');
      }

      return JSON.parse(textContent.text);
    } catch (error) {
      console.error('Error analyzing media:', error);
      return { error: 'Failed to analyze media' };
    }
  }
            }
