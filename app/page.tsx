'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Zap, Sparkles, Play, Loader } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { Project } from '@/lib/types';
import toast from 'react-hot-toast';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // In a real app, get userId from auth
        const userId = 'demo-user';
        const response = await apiGet<Project[]>(`/api/projects?userId=${userId}`);
        if (response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const createNewProject = async () => {
    try {
      setLoading(true);
      const response = await apiPost<Project>('/api/projects', {
        name: 'Untitled Project',
        aspectRatio: '9:16',
        userId: 'demo-user',
      });
      if (response.data) {
        setProjects([...projects, response.data]);
        window.location.href = `/editor/${response.data.id}`;
      }
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qc-bg">
      {/* Header */}
      <header className="border-b border-qc-border bg-qc-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-qc-primary to-qc-secondary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">QuickCut AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
              Help
            </button>
            <div className="w-8 h-8 rounded-full bg-qc-primary flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-qc-panel to-qc-bg py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-bold mb-4 leading-tight">
            Create Videos <span className="gradient-text">with AI.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Upload your clips. Tell QuickCut AI what you want. Get a finished video.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={createNewProject}
              disabled={loading}
              className="px-8 py-3 bg-qc-primary hover:bg-opacity-90 disabled:opacity-50 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Create New Project
            </button>
            <button className="px-8 py-3 border border-qc-border hover:border-qc-primary rounded-lg font-semibold transition">
              View Tutorial
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: 'AI Auto Edit',
              desc: 'Let AI handle the editing automatically',
            },
            {
              icon: Sparkles,
              title: 'Meme Mode',
              desc: 'Create funny edits with preset styles',
            },
            {
              icon: Play,
              title: 'Short Video',
              desc: 'Optimize for TikTok, Reels, YouTube Shorts',
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={createNewProject}
              disabled={loading}
              className="p-6 bg-qc-panel border border-qc-border hover:border-qc-primary rounded-lg text-left transition group disabled:opacity-50"
            >
              <item.icon className="w-6 h-6 mb-3 text-qc-primary group-hover:text-qc-secondary transition" />
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6">Recent Projects</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-qc-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-qc-panel border border-qc-border rounded-lg">
            <p className="text-gray-400">No projects yet.</p>
            <button
              onClick={createNewProject}
              className="text-qc-primary hover:text-qc-secondary mt-4 block mx-auto font-medium"
            >
              Create your first video →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/editor/${project.id}`}
                className="bg-qc-panel border border-qc-border rounded-lg overflow-hidden hover:border-qc-primary transition group"
              >
                <div className="aspect-video bg-gradient-to-br from-qc-primary to-qc-secondary opacity-20 flex items-center justify-center">
                  <Play className="w-12 h-12 text-qc-primary opacity-50 group-hover:opacity-100 transition" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold truncate">{project.name}</h4>
                  <p className="text-sm text-gray-400">{project.status}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-qc-border bg-qc-panel mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2024 QuickCut AI. Tell it what to edit. AI does the rest.</p>
        </div>
      </footer>
    </div>
  );
}
