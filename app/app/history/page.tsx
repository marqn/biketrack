'use client';

import React, { JSX, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, DollarSign, Bike, ChevronDown, Settings, Package } from 'lucide-react';

interface BikePart {
  id: number;
  name: string;
  category: string;
  date: string;
  price: number;
  mileage: number;
  reason: string;
  status: 'active' | 'replaced';
}

const BikePartsHistory: React.FC = () => {
  const [parts] = useState<BikePart[]>([
    {
      id: 1,
      name: "Shimano Deore XT M8100",
      category: "Przerzutka tylna",
      date: "2024-01-15",
      price: 389.99,
      mileage: 1250,
      reason: "Wymiana zużytej przerzutki",
      status: "active"
    },
    {
      id: 2,
      name: "Continental Grand Prix 5000",
      category: "Opony",
      date: "2023-11-22",
      price: 289.99,
      mileage: 3200,
      reason: "Standardowa wymiana opon",
      status: "replaced"
    },
    {
      id: 3,
      name: "Shimano XTR BR-M9100",
      category: "Hamulce",
      date: "2023-09-08",
      price: 599.99,
      mileage: 2100,
      reason: "Upgrade systemu hamulcowego",
      status: "active"
    },
    {
      id: 4,
      name: "SRAM Eagle GX Chain",
      category: "Łańcuch",
      date: "2023-07-14",
      price: 149.99,
      mileage: 2800,
      reason: "Zużycie łańcucha",
      status: "replaced"
    },
    {
      id: 5,
      name: "Race Face Chester Pedals",
      category: "Pedały",
      date: "2023-05-20",
      price: 199.99,
      mileage: 1500,
      reason: "Wymiana uszkodzonych pedałów",
      status: "active"
    },
    {
      id: 6,
      name: "WTB Silverado Saddle",
      category: "Siodełko",
      date: "2023-03-12",
      price: 249.99,
      mileage: 800,
      reason: "Poprawa komfortu jazdy",
      status: "active"
    },
    {
      id: 7,
      name: "Fox 36 Float Fork",
      category: "Widelec",
      date: "2023-01-25",
      price: 3499.99,
      mileage: 5200,
      reason: "Modernizacja zawieszenia",
      status: "active"
    },
    {
      id: 8,
      name: "Maxxis Minion DHF",
      category: "Opony",
      date: "2022-11-18",
      price: 319.99,
      mileage: 4100,
      reason: "Wymiana zużytych opon",
      status: "replaced"
    }
  ]);

  const getCategoryIcon = (category: string): JSX.Element => {
    switch(category.toLowerCase()) {
      case 'hamulce':
        return <Settings className="w-5 h-5" />;
      case 'opony':
        return <Bike className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalSpent: number = parts.reduce((sum, part) => sum + part.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Bike className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold  mb-2">
            Historia Wymian Części
          </h1>
          <p className="text-lg">
            Pełna dokumentacja serwisowa Twojego roweru
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className=" rounded-lg px-6 py-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{parts.length}</div>
              <div className="text-sm ">Wymian</div>
            </div>
            <div className=" rounded-lg px-6 py-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {totalSpent.toFixed(2)} zł
              </div>
              <div className="text-sm ">Łączny koszt</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-800"></div>

          {/* Parts list */}
          <div className="space-y-8">
            {parts.map((part) => (
              <div key={part.id} className="relative pl-20">
                {/* Timeline icon */}
                <div className="absolute left-3.5 top-6 p-2.5 bg-blue-600 rounded-full shadow-md ">
                  {getCategoryIcon(part.category)}
                </div>
                
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">
                          {part.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {part.category}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={part.status === 'active' ? 'default' : 'secondary'}
                        className={part.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {part.status === 'active' ? 'Aktywna' : 'Wymieniona'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Data wymiany:</span>
                        <span className="text-sm">{formatDate(part.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Koszt:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {part.price.toFixed(2)} zł
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Bike className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Przebieg:</span>
                        <span className="text-sm">{part.mileage} km</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Wrench className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Powód:</span>
                        <span className="text-sm">{part.reason}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* End indicator */}
          <div className="relative pl-20 mt-8">
            <div className="absolute left-6 top-0 w-5 h-5 bg-slate-300 rounded-full border-4 border-white"></div>
            <div className="text-center py-8 text-slate-500">
              <ChevronDown className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Początek historii serwisowej</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikePartsHistory;