import { supabaseAdmin } from '@/lib/supabase/client';
import { AnthropicAIProvider } from '@/lib/providers/anthropic-provider';
import { NextRequest, NextResponse } from 'next/server';

const aiProvider = new AnthropicAIProvider();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get chat history
    const { data: historyData } = await supabaseAdmin
      .from('ai_chat_history')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const history = (historyData || []).map((msg) => ({
      role: msg.role,
      content: msg.message,
    }));

    // Get AI response
    const response = await aiProvider.chat(params.id, message, history);

    // Save messages to history
    await supabaseAdmin.from('ai_chat_history').insert([
      {
        project_id: params.id,
        role: 'user',
        message,
      },
      {
        project_id: params.id,
        role: 'assistant',
        message: response,
      },
    ]);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('ai_chat_history')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
