import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SafeLensSidebar } from '@/components/SafeLensSidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { 
  getUserTests, 
  subscribeToTestUpdates, 
  unsubscribeFromTestUpdates,
  markNotificationAsRead,
  getTestStatistics,
  type ApiTest 
} from '@/lib/api-tests';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TestStatusPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  useEffect(() => {
    loadTests();
    loadStatistics();

    // Setup real-time subscription
    const user = auth.currentUser;
    if (user) {
      const subscription = subscribeToTestUpdates(user.uid, handleTestUpdate);
      
      return () => {
        unsubscribeFromTestUpdates(subscription);
      };
    }
  }, []);

  const loadTests = async () => {
    setLoading(true);
    const fetchedTests = await getUserTests(50);
    setTests(fetchedTests);
    setLoading(false);
  };

  const loadStatistics = async () => {
    const statistics = await getTestStatistics();
    setStats(statistics);
  };

  const handleTestUpdate = (updatedTest: ApiTest) => {
    console.log('Test updated:', updatedTest);
    
    // Update tests list
    setTests((prevTests) => {
      const existingIndex = prevTests.findIndex(t => t.id === updatedTest.id);
      if (existingIndex >= 0) {
        const newTests = [...prevTests];
        newTests[existingIndex] = updatedTest;
        return newTests;
      } else {
        return [updatedTest, ...prevTests];
      }
    });

    // Show notification if test completed
    if (updatedTest.status === 'completed' && !updatedTest.notification_read) {
      toast.success('Test Completed!', {
        description: `${updatedTest.test_name || 'Your test'} has finished processing.`,
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => {
            markNotificationAsRead(updatedTest.id);
            // Optionally scroll to the test or open details
          },
        },
      });
      
      // Mark as read after showing notification
      setTimeout(() => {
        markNotificationAsRead(updatedTest.id);
      }, 6000);
    }

    // Reload statistics
    loadStatistics();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'outline',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <SafeLensSidebar>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SafeLensSidebar>
    );
  }

  return (
    <SafeLensSidebar>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative">
        <div className="fixed top-6 right-6 z-40">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto p-6 max-w-7xl space-y-6 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Test History</h1>
              <p className="text-muted-foreground mt-1">
                Monitor your API security test status and results
              </p>
            </div>
            <Button onClick={loadTests} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tests</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your first API security test to see results here
            </p>
            <Button onClick={() => navigate('/')}>
              Start Testing
            </Button>
          </Card>
        ) : (
          tests.map((test) => (
            <Card 
              key={test.id} 
              className={`p-6 transition-all hover:shadow-lg ${
                !test.notification_read && test.status === 'completed' 
                  ? 'border-primary/50 bg-primary/5' 
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {test.test_name || 'API Security Test'}
                    </h3>
                    {getStatusBadge(test.status)}
                    {!test.notification_read && test.status === 'completed' && (
                      <Badge variant="default" className="bg-primary">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(test.created_at)}
                    </span>
                    <span>
                      {test.urls.length} {test.urls.length === 1 ? 'URL' : 'URLs'}
                    </span>
                    <span>
                      {test.test_types.length} {test.test_types.length === 1 ? 'test' : 'tests'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {(test.status === 'pending' || test.status === 'processing') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{test.progress}%</span>
                  </div>
                  <Progress value={test.progress} className="h-2" />
                </div>
              )}

              {/* Test Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">URLs Tested</p>
                  <div className="text-sm font-medium">
                    {test.urls.slice(0, 2).map((url, idx) => (
                      <div key={idx} className="truncate" title={url}>
                        {url}
                      </div>
                    ))}
                    {test.urls.length > 2 && (
                      <div className="text-muted-foreground">
                        +{test.urls.length - 2} more
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Test Types</p>
                  <div className="flex flex-wrap gap-1">
                    {test.test_types.map((type, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recipients</p>
                  <div className="text-sm">
                    {test.recipient_emails.length > 0 
                      ? `${test.recipient_emails.length} email${test.recipient_emails.length > 1 ? 's' : ''}`
                      : 'No recipients'
                    }
                  </div>
                </div>
              </div>

              {/* Results Summary - Only shown when completed */}
              {test.status === 'completed' && test.result_summary && (
                <div className="mb-4 p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Results Summary</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Issues</p>
                      <p className="text-xl font-bold">
                        {test.result_summary.vulnerabilities_found || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Critical</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-500">
                        {test.result_summary.critical || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-500">
                        {test.result_summary.high || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Medium</p>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                        {test.result_summary.medium || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-500">
                        {test.result_summary.low || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message - Only shown when failed */}
              {test.status === 'failed' && test.error_message && (
                <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <h4 className="font-semibold text-destructive">Error</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{test.error_message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {test.report_url && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => window.open(test.report_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                )}
                
                {test.email_sent && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Email Sent
                  </Badge>
                )}
                
                {test.completed_at && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Completed {formatDate(test.completed_at)}
                  </span>
                )}
              </div>
              </Card>
          ))
        )}
      </div>
        </div>
      </div>
    </SafeLensSidebar>
  );
};

export default TestStatusPage;

