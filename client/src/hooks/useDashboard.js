import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import { getLatestSnapshot, getSnapshotsHistory } from "../services/leetcodeService.js";
import { getMistakes } from "../services/mistakeService.js";
import { getRevisions } from "../services/revisionService.js";
import { getPatterns } from "../services/patternService.js";
import { compileDashboardData } from "../domain/dashboardMetrics.js";
import { buildRecommendations } from "../domain/recommendationEngine.js";

/**
 * Hook coordinating dashboard state fetching and client-side metrics compilation
 */
export function useDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setDashboard(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const [snapshot, mistakes, sessions, patterns, snapshots] = await Promise.all([
        getLatestSnapshot(),
        getMistakes(),
        getRevisions(),
        getPatterns(),
        getSnapshotsHistory(24)
      ]);

      const compiledMetrics = compileDashboardData({
        user,
        snapshot,
        mistakes,
        sessions,
        patterns,
        snapshots
      });

      const openMistakes = mistakes.filter((m) => m.status !== "resolved");
      const recommendations = buildRecommendations({
        snapshot,
        mistakes: openMistakes,
        patterns,
        topicInsights: compiledMetrics.topicInsights,
        sessions
      });

      setDashboard({
        ...compiledMetrics,
        recommendations
      });
    } catch (err) {
      console.error("Dashboard compilation failed:", err);
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    refreshDashboard: loadDashboard
  };
}
