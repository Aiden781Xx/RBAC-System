'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth-client';

export default function NaturalLanguagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ command: string; response: string; timestamp: Date }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/natural-language', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Command executed successfully',
        });
        setHistory([
          {
            command,
            response: data.message || 'Command executed successfully',
            timestamp: new Date(),
          },
          ...history,
        ]);
        setCommand('');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Command failed',
          variant: 'destructive',
        });
        setHistory([
          {
            command,
            response: data.error || 'Command failed',
            timestamp: new Date(),
          },
          ...history,
        ]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleCommands = [
    "Give the role 'Content Editor' the permission to 'edit articles'",
    "Create a new permission called 'publish content'",
    "Create a new role called 'Support Agent'",
    "Remove permission 'delete users' from role 'Editor'",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              Natural Language Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure your RBAC settings using plain English
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Command</CardTitle>
            <CardDescription>
              Type a command in plain English to modify RBAC settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., Give the role 'Content Editor' the permission to 'edit articles'"
                rows={4}
                className="resize-none"
              />
              <Button type="submit" disabled={isLoading || !command.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Execute Command'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Example Commands</CardTitle>
            <CardDescription>
              Try these example commands to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exampleCommands.map((example, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-muted-foreground mr-2">•</span>
                  <button
                    onClick={() => setCommand(example)}
                    className="text-left text-sm text-primary hover:underline"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Command History</CardTitle>
              <CardDescription>
                Recent commands and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Command:</p>
                      <span className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm bg-muted p-2 rounded">{item.command}</p>
                    <p className="font-medium text-sm">Response:</p>
                    <p className="text-sm bg-primary/10 text-primary p-2 rounded">
                      {item.response}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

