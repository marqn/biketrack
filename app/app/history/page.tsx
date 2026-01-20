'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, DollarSign, Bike, ChevronDown, Settings, Package, Disc, Zap, Mountain, ChevronUp } from 'lucide-react';

interface PartReplacement {
  id: string;
  partType: string;
  brand: string | null;
  model: string | null;
  notes: string | null;
  kmAtReplacement: number;
  kmUsed: number;
  createdAt: string;
}

interface BikeInfo {
  id: string;
  name: string | null;
  brand: string | null;
  model: string | null;
  totalKm: number;
}

const BikePartsHistory: React.FC = () => {
  const [parts, setParts] = useState<PartReplacement[]>([]);
  const [bike, setBike] = useState<BikeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartReplacements();
  }, []);

  const fetchPartReplacements = async () => {
    try {
      setLoading(true);
      // Zakładam endpoint API - dostosuj do swojej struktury
      const response = await fetch('/api/parts/replacements');
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać danych');
      }
      
      const data = await response.json();
      setParts(data.replacements || []);
      setBike(data.bike || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (partType: string): JSX.Element => {
    switch(partType) {
      case 'CHAIN':
        return <Package className="w-5 h-5" />;
      case 'CASSETTE':
        return <Settings className="w-5 h-5" />;
      case 'PADS_FRONT':
      case 'PADS_REAR':
        return <Disc className="w-5 h-5" />;
      case 'TIRE_FRONT':
      case 'TIRE_REAR':
        return <Bike className="w-5 h-5" />;
      case 'SUSPENSION_FORK':
      case 'SUSPENSION_SEATPOST':
        return <Mountain className="w-5 h-5" />;
      case 'DROPPER_POST':
        return <ChevronUp className="w-5 h-5" />;
      case 'CHAINRING_1X':
        return <Zap className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const getPartTypeName = (partType: string): string => {
    const names: Record<string, string> = {
      CHAIN: 'Łańcuch',
      CASSETTE: 'Kaseta',
      PADS_FRONT: 'Klocki hamulcowe przednie',
      PADS_REAR: 'Klocki hamulcowe tylne',
      TIRE_FRONT: 'Opona przednia',
      TIRE_REAR: 'Opona tylna',
      CHAINRING_1X: 'Zębatka 1x',
      SUSPENSION_FORK: 'Widelec amortyzowany',
      DROPPER_POST: 'Sztyca teleskopowa',
      TUBELESS_SEALANT: 'Mleczko tubeless',
      HANDLEBAR_TAPE: 'Owijka kierownicy',
      SUSPENSION_SEATPOST: 'Sztyca amortyzowana',
    };
    return names[partType] || partType;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Ładowanie historii wymian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Błąd</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Bike className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Historia Wymian Części
          </h1>
          {bike && (
            <p className="text-lg">
              {bike.brand && bike.model ? `${bike.brand} ${bike.model}` : bike.name || 'Twój rower'}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className=" rounded-lg px-6 py-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{parts.length}</div>
              <div className="text-sm ">Wymian</div>
            </div>
            {bike && (
              <div className=" rounded-lg px-6 py-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {bike.totalKm.toLocaleString('pl-PL')} km
                </div>
                <div className="text-sm ">Łączny przebieg</div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        {parts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16  mx-auto mb-4" />
              <p className=" text-lg">Brak historii wymian</p>
              <p className=" text-sm mt-2">Wymiany części będą tutaj wyświetlane</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

            {/* Parts list */}
            <div className="space-y-8">
              {parts.map((part) => (
                <div key={part.id} className="relative pl-20">
                  {/* Timeline icon */}
                  <div className="absolute left-3.5 top-6 p-2.5 bg-blue-600 rounded-full shadow-md text-white">
                    {getCategoryIcon(part.partType)}
                  </div>
                  
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {part.brand && part.model 
                              ? `${part.brand} ${part.model}`
                              : getPartTypeName(part.partType)
                            }
                          </CardTitle>
                          <CardDescription className="text-base">
                            {getPartTypeName(part.partType)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {part.kmUsed.toLocaleString('pl-PL')} km
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 ">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Data wymiany:</span>
                          <span className="text-sm">{formatDate(part.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 ">
                          <Bike className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Przebieg roweru:</span>
                          <span className="text-sm">{part.kmAtReplacement.toLocaleString('pl-PL')} km</span>
                        </div>
                        <div className="flex items-center gap-2 ">
                          <Wrench className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Zużycie części:</span>
                          <span className="text-sm font-semibold text-orange-600">
                            {part.kmUsed.toLocaleString('pl-PL')} km
                          </span>
                        </div>
                        {part.notes && (
                          <div className="flex items-start gap-2  md:col-span-2">
                            <Package className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium">Notatki: </span>
                              <span className="text-sm">{part.notes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* End indicator */}
            <div className="relative pl-20 mt-8">
              <div className="absolute left-6 top-0 w-5 h-5 bg-slate-300 rounded-full border-4 border-white"></div>
              <div className="text-center py-8 ">
                <ChevronDown className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Początek historii serwisowej</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BikePartsHistory;