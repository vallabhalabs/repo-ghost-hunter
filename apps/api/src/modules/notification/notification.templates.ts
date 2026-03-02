import { WeeklyReportData, RepositoryReport } from './notification.service';

export class NotificationTemplates {
  static generateWeeklyReportHTML(
    userName: string,
    reportData: WeeklyReportData,
  ): string {
    const { totalRepos, averageHealthScore, healthyCount, atRiskCount, criticalCount, criticalRepos, atRiskRepos } = reportData;

    const riskLevel = criticalCount > 0 ? 'critical' : atRiskCount > 0 ? 'warning' : 'good';
    const riskEmoji = criticalCount > 0 ? '⚠️' : atRiskCount > 0 ? '⚡' : '✅';
    const riskCount = criticalCount + atRiskCount;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Repo Health Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
        }
        .header .subtitle {
            color: #6c757d;
            font-size: 16px;
            margin-top: 8px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin: 32px 0;
        }
        .stat-card {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .stat-card.warning {
            border-left-color: #ffc107;
        }
        .stat-card.critical {
            border-left-color: #dc3545;
        }
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        .stat-label {
            font-size: 14px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            margin: 32px 0;
        }
        .section h2 {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .repo-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
        }
        .repo-item {
            background: white;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 12px;
            border: 1px solid #e9ecef;
        }
        .repo-item:last-child {
            margin-bottom: 0;
        }
        .repo-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .repo-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 12px;
            font-size: 14px;
            color: #6c757d;
        }
        .repo-meta span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .health-score {
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .health-score.healthy {
            background: #d4edda;
            color: #155724;
        }
        .health-score.at-risk {
            background: #fff3cd;
            color: #856404;
        }
        .health-score.critical {
            background: #f8d7da;
            color: #721c24;
        }
        .cta {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            display: block;
            margin-top: 32px;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .emoji {
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${riskEmoji} Repo Health Report</h1>
            <div class="subtitle">Weekly summary for ${userName}</div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalRepos}</div>
                <div class="stat-label">Total Repos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${averageHealthScore.toFixed(1)}</div>
                <div class="stat-label">Avg Health</div>
            </div>
            <div class="stat-card ${riskLevel === 'critical' ? 'critical' : riskLevel === 'warning' ? 'warning' : ''}">
                <div class="stat-number">${riskCount}</div>
                <div class="stat-label">At Risk</div>
            </div>
        </div>

        ${criticalRepos.length > 0 ? `
        <div class="section">
            <h2><span class="emoji">⚠️</span> Critical Repositories (${criticalRepos.length})</h2>
            <div class="repo-list">
                ${criticalRepos.map(repo => this.generateRepoHTML(repo, 'critical')).join('')}
            </div>
        </div>
        ` : ''}

        ${atRiskRepos.length > 0 ? `
        <div class="section">
            <h2><span class="emoji">⚡</span> At Risk Repositories (${atRiskRepos.length})</h2>
            <div class="repo-list">
                ${atRiskRepos.map(repo => this.generateRepoHTML(repo, 'at-risk')).join('')}
            </div>
        </div>
        ` : ''}

        <a href="https://github.com/vallabhalabs/repo-ghost-hunter" class="cta">
            🚀 View Full Dashboard
        </a>

        <div class="footer">
            <p>This repo is about to die ☠️ if you don't take action!</p>
            <p style="font-size: 12px; margin-top: 8px;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  static generateWeeklyReportText(
    userName: string,
    reportData: WeeklyReportData,
  ): string {
    const { totalRepos, averageHealthScore, healthyCount, atRiskCount, criticalCount, criticalRepos, atRiskRepos } = reportData;

    let text = `Weekly Repo Health Report for ${userName}\n`;
    text += `=====================================\n\n`;
    text += `📊 Overview:\n`;
    text += `• Total Repositories: ${totalRepos}\n`;
    text += `• Average Health Score: ${averageHealthScore.toFixed(1)}\n`;
    text += `• Healthy: ${healthyCount} | At Risk: ${atRiskCount} | Critical: ${criticalCount}\n\n`;

    if (criticalRepos.length > 0) {
      text += `⚠️  Critical Repositories (${criticalRepos.length}):\n`;
      criticalRepos.forEach((repo, index) => {
        text += `${index + 1}. ${repo.fullName} (Score: ${repo.healthScore})\n`;
        text += `   • Last commit: ${repo.lastCommitAt.toLocaleDateString()}\n`;
        text += `   • Open PRs: ${repo.openPrCount} | Open Issues: ${repo.openIssueCount}\n`;
      });
      text += `\n`;
    }

    if (atRiskRepos.length > 0) {
      text += `⚡ At Risk Repositories (${atRiskRepos.length}):\n`;
      atRiskRepos.forEach((repo, index) => {
        text += `${index + 1}. ${repo.fullName} (Score: ${repo.healthScore})\n`;
        text += `   • Last commit: ${repo.lastCommitAt.toLocaleDateString()}\n`;
        text += `   • Open PRs: ${repo.openPrCount} | Open Issues: ${repo.openIssueCount}\n`;
      });
      text += `\n`;
    }

    text += `🚀 This repo is about to die ☠️ if you don't take action!\n`;
    text += `View your full dashboard: https://github.com/vallabhalabs/repo-ghost-hunter\n\n`;
    text += `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;

    return text;
  }

  private static generateRepoHTML(repo: RepositoryReport, status: string): string {
    const daysSinceLastCommit = Math.floor(
      (new Date().getTime() - new Date(repo.lastCommitAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return `
        <div class="repo-item">
            <div class="repo-name">${repo.fullName}</div>
            <div class="repo-meta">
                <span>📅 ${daysSinceLastCommit} days ago</span>
                <span>🔀 ${repo.openPrCount} PRs</span>
                <span>🐛 ${repo.openIssueCount} issues</span>
                <span class="health-score ${status}">${repo.healthScore.toFixed(1)}</span>
            </div>
        </div>
    `.trim();
  }
}
