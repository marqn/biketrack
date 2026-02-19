'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function BikeRideSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Anna Kowalska', initials: 'AK', avatar: null },
    { id: 2, name: 'Jan Nowak', initials: 'JN', avatar: null },
    { id: 3, name: 'Maria Wiśniewska', initials: 'MW', avatar: null },
    { id: 4, name: 'Piotr Zieliński', initials: 'PZ', avatar: null },
  ]);
  const [comments, setComments] = useState([
    { id: 1, author: 'Anna Kowalska', text: 'Super pomysł! Nie mogę się doczekać! 🚴‍♀️', time: '2 godz. temu' },
    { id: 2, author: 'Jan Nowak', text: 'Jaki planowany dystans?', time: '1 godz. temu' },
    { id: 3, author: 'Maria Wiśniewska', text: 'Około 45 km przez las i pola', time: '45 min. temu' },
  ]);

  const handleSubmit = () => {
    if (name.trim()) {
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      setParticipants([...participants, { 
        id: participants.length + 1, 
        name, 
        initials, 
        avatar: null 
      }]);
      setName('');
      setEmail('');
      alert(`Dziękujemy za zapisanie się, ${name}!`);
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        author: 'Ty',
        text: comment,
        time: 'Teraz'
      }]);
      setComment('');
    }
  };

  return (
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          <div className="relative h-64 md:h-80 bg-gradient-to-r from-green-400 to-blue-500 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <div className="text-6xl mb-4">🚴‍♂️</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Wiosenna Ustawka</h1>
                <p className="text-xl md:text-2xl">Mazurskim Szlakiem</p>
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">Sobota, 15 marca 2025</CardTitle>
            <CardDescription className="text-base mt-2">
              Zapraszamy na wiosenną przejażdżkę rowerową przez malownicze mazurskie krajobrazy! 
              Startujemy o godzinie 10:00 spod ratusza w Giżycku. Trasa prowadzi przez lasy i pola, 
              z przerwą na piknik nad jeziorem. Dystans: około 45 km (poziom średniozaawansowany).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Szczegóły wydarzenia
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">📍 Start: Ratusz w Giżycku</Badge>
                  <Badge variant="outline">⏱️ Czas: ~4 godz.</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">🎒 Zabierz: wodę, przekąski</Badge>
                  <Badge variant="outline">☀️ Sprawdź pogodę!</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Zapisz się na przejażdżkę</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Imię i nazwisko *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jan Kowalski"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Adres e-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan@example.com"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700"
                  
                >
                  Dołącz
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Uczestnicy ({participants.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12 border-2 border-green-500">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {participant.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-center max-w-[60px] truncate" title={participant.name}>
                      {participant.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Komentarze ({comments.length})</h3>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="comment">Dodaj komentarz</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Napisz coś..."
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCommentSubmit}
                  variant="outline" 
                  className="w-full"
                  disabled={!comment.trim()}
                >
                  Dodaj komentarz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}