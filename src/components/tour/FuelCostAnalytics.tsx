import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Fuel,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { RouteStop } from '@/types';

interface FuelCostAnalyticsProps {
  routeStops: RouteStop[];
  vehicleType: 'car' | 'suv' | 'rv' | 'ev' | 'hybrid';
  tripDistance: number;
  preferences?: {
    budget?: string;
  };
}

export function FuelCostAnalytics({
  routeStops,
  vehicleType,
  tripDistance,
  preferences
}: FuelCostAnalyticsProps) {
  // Vehicle specs
  const vehicleSpecs = {
    car: { mpg: 28, tankSize: 14, name: 'Sedan' },
    suv: { mpg: 22, tankSize: 16, name: 'SUV' },
    rv: { mpg: 10, tankSize: 75, name: 'RV' },
    ev: { efficiency: 0.25, chargePrice: 0.15, name: 'Electric' }, // kWh per mile, $ per kWh
    hybrid: { mpg: 48, tankSize: 11, name: 'Hybrid' }
  };

  const specs = vehicleSpecs[vehicleType] as any;

  // Calculate costs
  const fuelStops = routeStops.filter(s => s.type === 'fuel');
  const chargingStops = routeStops.filter(s => s.type === 'charging');

  const fuelCostData = useMemo(() => {
    let totalFuelCost = 0;
    let avgFuelPrice = 0;

    if (fuelStops.length > 0) {
      const fuelPrices = fuelStops
        .map(stop => (stop.fuelInfo?.pricePerGallon || 3.50) + (stop.fuelInfo?.loyaltyDiscount || 0))
        .filter(price => price > 0);
      
      avgFuelPrice = fuelPrices.length > 0 ? fuelPrices.reduce((a, b) => a + b) / fuelPrices.length : 3.50;
      
      totalFuelCost = fuelStops.reduce((sum, stop) => {
        return sum + (stop.fuelInfo?.estimatedCost || 0);
      }, 0);
    } else if (vehicleType !== 'ev') {
      // Estimate if no fuel stops
      avgFuelPrice = 3.50;
      const gallonsNeeded = tripDistance / specs.mpg;
      totalFuelCost = gallonsNeeded * avgFuelPrice;
    }

    return { totalFuelCost, avgFuelPrice };
  }, [fuelStops, vehicleType]);

  const evCostData = useMemo(() => {
    let totalChargeCost = 0;
    const avgChargePrice = 0.15; // $ per kWh average

    if (chargingStops.length > 0) {
      // Estimate from charging stops
      totalChargeCost = chargingStops.reduce((sum, stop) => {
        const chargeEstimate = (tripDistance * specs.efficiency || 0) * avgChargePrice;
        return sum + chargeEstimate;
      }, 0);
    } else {
      const kwhNeeded = tripDistance * (specs.efficiency || 0.25);
      totalChargeCost = kwhNeeded * avgChargePrice;
    }

    return { totalChargeCost, avgChargePrice };
  }, [chargingStops, vehicleType]);

  // Comparison data
  const comparisonData = [
    {
      name: 'Gas (Car)',
      cost: (tripDistance / 28) * 3.50,
      color: '#ff9800'
    },
    {
      name: 'Hybrid',
      cost: (tripDistance / 48) * 3.50,
      color: '#8bc34a'
    },
    {
      name: 'Electric',
      cost: (tripDistance * 0.25) * 0.15,
      color: '#2196f3'
    },
    {
      name: 'SUV',
      cost: (tripDistance / 22) * 3.50,
      color: '#f44336'
    }
  ];

  // Savings analysis
  const gasCost = (tripDistance / 28) * 3.50;
  const evCost = (tripDistance * 0.25) * 0.15;
  const hybridCost = (tripDistance / 48) * 3.50;
  const savings = {
    evVsGas: gasCost - evCost,
    hybridVsGas: gasCost - hybridCost,
    currentVsGas: vehicleType === 'ev' ? gasCost - evCost : vehicleType === 'hybrid' ? gasCost - hybridCost : 0
  };

  // Monthly projection
  const monthlyData = [
    { week: 'Week 1', gas: (tripDistance * 0.25) * 3.50 * 3, electric: (tripDistance * 0.25) * 0.15 * 3 },
    { week: 'Week 2', gas: (tripDistance * 0.25) * 3.50 * 2, electric: (tripDistance * 0.25) * 0.15 * 2 },
    { week: 'Week 3', gas: (tripDistance * 0.25) * 3.50 * 4, electric: (tripDistance * 0.25) * 0.15 * 4 },
    { week: 'Week 4', gas: (tripDistance * 0.25) * 3.50 * 3, electric: (tripDistance * 0.25) * 0.15 * 3 }
  ];

  // Loyalty program savings
  const loyaltySavings = fuelStops.reduce((sum, stop) => {
    return sum + Math.abs(stop.fuelInfo?.loyaltyDiscount || 0) * 15; // 15 gallons per stop average
  }, 0);

  return (
    <div className="space-y-6 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Trip Cost Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trip Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${vehicleType === 'ev' ? evCostData.totalChargeCost.toFixed(2) : fuelCostData.totalFuelCost.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        {/* Savings Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">vs Gas Sedan</p>
                <p className="text-2xl font-bold text-green-600">
                  ${savings.currentVsGas.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicleType === 'ev' 
                    ? `${(specs.efficiency * 1000).toFixed(0)} Wh/mi`
                    : `${specs.mpg} MPG`
                  }
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-300" />
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Savings Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Loyalty Savings</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${loyaltySavings.toFixed(2)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Cost Comparison: {tripDistance} Miles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Bar dataKey="cost" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Cheapest:</strong> Electric - ${evCost.toFixed(2)} for {tripDistance} miles
            </p>
            <p>
              <strong>Most Expensive:</strong> SUV - ${(tripDistance / 22 * 3.50).toFixed(2)} for {tripDistance} miles
            </p>
            <p>
              <strong>Your Vehicle ({vehicleType.toUpperCase()}):</strong> $
              {vehicleType === 'ev' ? evCost.toFixed(2) : vehicleType === 'hybrid' ? hybridCost.toFixed(2) : (tripDistance / specs.mpg * 3.50).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Cost Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="gas" stroke="#ff9800" name="Gas (Car)" strokeWidth={2} />
              <Line type="monotone" dataKey="electric" stroke="#2196f3" name="Electric" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fuel Stops Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="h-5 w-5 mr-2" />
              Fuel Stops ({fuelStops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fuelStops.length > 0 ? (
              <div className="space-y-2">
                {fuelStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{stop.fuelInfo?.brand || 'Gas Station'}</p>
                      <p className="text-xs text-gray-600">
                        ${(stop.fuelInfo?.pricePerGallon || 3.50).toFixed(2)}/gal
                      </p>
                    </div>
                    <p className="font-bold">${(stop.fuelInfo?.estimatedCost || 0).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>${fuelCostData.totalFuelCost.toFixed(2)}</span>
                  </div>
                  {loyaltySavings > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      💳 Loyalty Savings: ${loyaltySavings.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No fuel stops planned</p>
                <p className="text-xs mt-1">Estimated cost: ${fuelCostData.totalFuelCost.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charging Stops Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Charging Stops ({chargingStops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chargingStops.length > 0 ? (
              <div className="space-y-2">
                {chargingStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{stop.name}</p>
                      <p className="text-xs text-gray-600">
                        Est. {stop.estimatedTime || 25} min charge
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm text-blue-600">
                    ⚡ Est. Charging Cost: ${evCostData.totalChargeCost.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No charging stops planned</p>
                <p className="text-xs mt-1">Estimated cost: ${evCostData.totalChargeCost.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <AlertCircle className="h-5 w-5 mr-2" />
            Cost Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          {vehicleType === 'car' || vehicleType === 'suv' ? (
            <>
              <p>
                ✅ <strong>Use loyalty programs:</strong> Save ${loyaltySavings.toFixed(2)} with Shell/Chevron rewards
              </p>
              <p>
                💡 <strong>Consider hybrid upgrade:</strong> Would save ${savings.hybridVsGas.toFixed(2)} on this trip
              </p>
              <p>
                🔋 <strong>Consider EV:</strong> Would save ${savings.evVsGas.toFixed(2)} on this trip
              </p>
              <p>
                ⏰ <strong>Refuel early week:</strong> Gas prices typically drop Mon-Wed, save 10-15 cents/gallon
              </p>
            </>
          ) : vehicleType === 'hybrid' ? (
            <>
              <p>
                ✅ <strong>Great choice!</strong> Saving ${savings.hybridVsGas.toFixed(2)} vs traditional car
              </p>
              <p>
                💡 <strong>Maximize hybrid mode:</strong> Lighter driving saves additional 5-10% fuel
              </p>
              <p>
                🔋 <strong>Consider EV next:</strong> Would save additional ${savings.evVsGas.toFixed(2)}
              </p>
            </>
          ) : (
            <>
              <p>
                ✅ <strong>Excellent savings!</strong> You're saving ${savings.evVsGas.toFixed(2)} vs gas cars
              </p>
              <p>
                ⚡ <strong>Charge during off-peak:</strong> Save 20-30% by charging 9pm-6am
              </p>
              <p>
                🏠 <strong>Install home charger:</strong> Most cost-effective for frequent long trips
              </p>
              <p>
                📱 <strong>Use supercharger network:</strong> Faster charging on cross-country routes
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
