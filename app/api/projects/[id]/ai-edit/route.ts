import { supabaseAdmin } from '@/lib/supabase/client';
import { AnthropicAIProvider } from '@/lib/providers/anthropic-provider';
import { AIEditRequest, AIEditResponse } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const aiProvider = new AnthropicAIProvider();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const {
      userInstruction,
      mediaIds,
      aspectRatio,
      targetDuration,
      style,
    }: Partial<AIEditRequest> = await req.json();

    if (!userInstruction || !mediaIds || !aspectRatio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Generate editing plan
    const editingResponse = await aiProvider.generateEditingPlan({
      project_id: params.id,
      user_instruction: userInstruction,
      media_ids: mediaIds,
      aspect_ratio: aspectRatio,
      target_duration: targetDuration,
      style,
    });

    // Save editing plan
    const { data, error } = await supabaseAdmin
      .from('editing_plans')
      .insert([
        {
          project_id: params.id,
          plan_data: editingResponse.plan,
          version: 1,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(editingResponse);
  } catch (error) {
    console.error('Error generating editing plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate editing plan' },
      { status: 500 }
    );
  }
}
