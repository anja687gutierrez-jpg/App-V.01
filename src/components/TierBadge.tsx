/**
 * Tier Badge Component
 *
 * Military/Achievement style badge showing user's membership tier
 * Displays on Dashboard and other key pages
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield, Crown, Star, Sparkles, Zap, MapPin, Navigation, Info } from 'lucide-react';
import type { MembershipTier } from '@/types';

interface TierBadgeProps {
  tier: MembershipTier;
  compact?: boolean;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const TIER_CONFIG = {
  free: {
    name: 'Free Explorer',
    icon: Shield,
    color: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    accentColor: 'text-gray-600',
    emoji: '🆓',
    ribbon: 'bg-gray-500',
    shine: 'bg-gradient-to-br from-gray-300/20 to-transparent',
    benefits: [
      '3 saved trips (lifetime)',
      'Up to 7 waypoints per trip',
      'Mock route calculations',
      '10 AI messages per trip',
    ],
    description: 'Perfect for casual travelers testing the app',
    price: 'Free',
  },
  basic: {
    name: 'Basic Explorer',
    icon: Star,
    color: 'from-amber-400 to-amber-600',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    bgColor: 'bg-amber-50',
    accentColor: 'text-amber-600',
    emoji: '🥉',
    ribbon: 'bg-amber-500',
    shine: 'bg-gradient-to-br from-yellow-200/40 to-transparent',
    benefits: [
      '25 saved trips (lifetime)',
      'Up to 25 waypoints per trip',
      'Real-time routing & navigation',
      '100 route calculations/month',
      'Unlimited AI companion',
      'Offline access (5 trips)',
    ],
    description: 'Unlock real navigation for regular road trippers',
    price: '$29.99 one-time',
  },
  advanced: {
    name: 'Advanced Explorer',
    icon: Crown,
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-900',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600',
    emoji: '🥈',
    ribbon: 'bg-blue-500',
    shine: 'bg-gradient-to-br from-blue-200/40 to-transparent',
    benefits: [
      'Unlimited saved trips',
      'Up to 100 waypoints per trip',
      'Route optimization',
      '500 route calculations/month',
      'Unlimited offline access',
      'Live tracking & analytics',
    ],
    description: 'Optimize everything for frequent travelers',
    price: '$59.99 one-time',
  },
  expert: {
    name: 'Expert Explorer',
    icon: Sparkles,
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-900',
    bgColor: 'bg-purple-50',
    accentColor: 'text-purple-600',
    emoji: '🥇',
    ribbon: 'bg-purple-500',
    shine: 'bg-gradient-to-br from-purple-200/40 to-transparent',
    benefits: [
      'Unlimited everything',
      'Premium API access',
      'Priority AI responses',
      'Advanced route optimization',
      'API access & data export',
      'Priority support & beta access',
    ],
    description: 'Professional-grade tools for tour companies & creators',
    price: '$99.99 one-time',
  },
  test: {
    name: 'Developer',
    icon: Zap,
    color: 'from-emerald-400 to-emerald-600',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-900',
    bgColor: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    emoji: '🧪',
    ribbon: 'bg-emerald-500',
    shine: 'bg-gradient-to-br from-emerald-200/40 to-transparent',
    benefits: [
      'Unlimited access to all features',
      'Debug mode & API monitoring',
      'Test all membership tiers',
      'Priority development features',
    ],
    description: 'Development & testing access',
    price: 'Internal',
  },
};

export function TierBadge({ tier, compact = false, showUpgrade = false, onUpgrade }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={`${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold px-3 py-1 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <span className="mr-1">{config.emoji}</span>
            {config.name}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 border-b pb-2">
              <div className={`p-2 rounded-full bg-gradient-to-br ${config.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${config.textColor}`}>
                  {config.emoji} {config.name}
                </h4>
                {config.price && (
                  <p className="text-xs text-muted-foreground">{config.price}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground italic">{config.description}</p>

            {/* Benefits */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Benefits:</p>
              {config.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className={`mt-1 w-1 h-1 rounded-full ${config.bgColor} ${config.borderColor} border-2`} />
                  <p className="text-xs text-slate-600 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className={`mt-3 p-2 rounded-md ${config.bgColor} border ${config.borderColor}`}>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                <strong>Note:</strong> You never lose access to trips you've already created. Limits only apply to creating new content.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${config.borderColor} border-2 shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Ribbon corner */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-current opacity-20"
           style={{ color: config.ribbon.replace('bg-', '') }}
      />

      {/* Shine effect */}
      <div className={`absolute inset-0 ${config.shine} pointer-events-none`} />

      <CardContent className={`p-4 ${config.bgColor} relative`}>
        <div className="flex items-center gap-4">
          {/* Badge icon with gradient */}
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${config.color} p-1 shadow-md`}>
            <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center">
              <Icon className={`w-8 h-8 ${config.accentColor}`} />
            </div>
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-30 blur-sm -z-10`} />
          </div>

          {/* Tier info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{config.emoji}</span>
              <h3 className={`font-bold text-lg ${config.textColor}`}>
                {config.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {tier === 'free' && (
                <p className="text-xs text-gray-600">
                  3 trips • 7 waypoints • Mock routes
                </p>
              )}
              {tier === 'basic' && (
                <p className="text-xs text-amber-700">
                  25 trips • 25 waypoints • Real routing
                </p>
              )}
              {tier === 'advanced' && (
                <p className="text-xs text-blue-700">
                  Unlimited trips • 100 waypoints • Optimized
                </p>
              )}
              {tier === 'expert' && (
                <p className="text-xs text-purple-700">
                  Unlimited everything • Premium features
                </p>
              )}
              {tier === 'test' && (
                <p className="text-xs text-emerald-700">
                  Unlimited access • All features • Debug mode
                </p>
              )}
            </div>
          </div>

          {/* Upgrade button */}
          {showUpgrade && tier === 'free' && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              Upgrade ✨
            </button>
          )}
        </div>

        {/* Decorative stars for premium tiers */}
        {(tier === 'advanced' || tier === 'expert' || tier === 'test') && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-20">
            <Star className="w-3 h-3 fill-current" />
            <Star className="w-3 h-3 fill-current" />
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mini tier badge for compact spaces
 */
export function TierBadgeMini({ tier }: { tier: MembershipTier }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
      <Icon className={`w-3 h-3 ${config.accentColor}`} />
      <span className={`text-xs font-semibold ${config.textColor}`}>
        {config.name}
      </span>
    </div>
  );
}
