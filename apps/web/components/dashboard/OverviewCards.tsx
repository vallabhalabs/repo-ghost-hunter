import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { AnalyticsOverview } from '@/hooks/use-analytics';

interface OverviewCardsProps {
  data: AnalyticsOverview | undefined;
  isLoading: boolean;
}

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Repositories',
      value: data?.total_repositories || 0,
      subtitle: 'All repositories',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Healthy',
      value: data?.healthy_repositories || 0,
      subtitle: 'Score > 75',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'At Risk',
      value: data?.at_risk_repositories || 0,
      subtitle: 'Score 40-75',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Critical',
      value: data?.critical_repositories || 0,
      subtitle: 'Score < 40',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Average Health Score Card */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Average Health Score
          </CardTitle>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <span className={getHealthScoreColor(data?.average_health_score || 0)}>
                {data?.average_health_score?.toFixed(1) || '0.0'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Overall repository health
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getHealthScoreColor(score: number): string {
  if (score > 75) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}
