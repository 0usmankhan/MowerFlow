'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, StopCircle, Bot, AlertTriangle, Loader2 } from 'lucide-react';
import { transcribeAudioAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function VoiceMemo() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcribedText, setTranscribedText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = handleStopRecording;
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setError(null);
        setTranscribedText('');
      } catch (err) {
        setError('Microphone access denied. Please enable microphone permissions in your browser settings.');
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access the microphone. Please check your browser permissions.',
        });
      }
    } else {
        setError('Audio recording is not supported by your browser.');
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
        if(mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size === 0) return;
        
        setIsLoading(true);

        // Convert Blob to Data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            try {
                const result = await transcribeAudioAction(base64Audio);
                setTranscribedText(result.transcription);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred during transcription.');
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Failed to read audio data.');
            setIsLoading(false);
        }

        // Stop media tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Voice Memo</CardTitle>
            <CardDescription>Record a voice note and let AI transcribe it for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
            <Button onClick={handleToggleRecording} size="icon" className={`rounded-full h-14 w-14 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}>
                {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <div>
                <p className="font-semibold">{isRecording ? 'Recording...' : 'Record a note'}</p>
                <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Click to stop' : 'Click the mic to start'}
                </p>
            </div>
            </div>

            {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                <h4 className="font-bold">Error</h4>
                <p>{error}</p>
                </div>
            </div>
            )}

            {isLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
            )}

            {!isLoading && transcribedText && (
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center"><Bot className="mr-2 h-5 w-5" /> AI Transcription</h4>
                <Textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    rows={5}
                    placeholder="Your transcribed text will appear here..."
                />
            </div>
            )}
        </CardContent>
    </Card>
  );
}
