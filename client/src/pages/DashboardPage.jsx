import React, { useEffect, useState } from "react";
import KPIGrid from "../components/dashboard/KPIGrid";
import EnrolledCoursesTable from "../components/dashboard/EnrolledCoursesTable";
import UpcomingDeadlinesWidget from "../components/dashboard/UpcomingDeadlinesWidget";
import { academicsService } from "../services/api";

export default function DashboardPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await academicsService.getAcademicProgress();
        setProgress(data);
      } catch (err) {
        setError("Failed to load academic progress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 border border-error/20 text-error rounded-lg text-body-md flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">error</span>
        <span>{error}</span>
      </div>
    );
  }

  const enrolledCourses = progress?.enrolled_courses || [];
  const upcomingDeadlines = progress?.upcoming_deadlines || [];
  const pendingDeadlinesCount = upcomingDeadlines.filter(
    (d) => d.status?.toLowerCase() === "pending",
  ).length;

  return (
    <div>
      <KPIGrid
        gpa={progress?.gpa || 0.0}
        enrolledCount={enrolledCourses.length}
        completedCredits={progress?.completed_credits || 0}
        pendingDeadlinesCount={pendingDeadlinesCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-container_gap">
        <EnrolledCoursesTable courses={enrolledCourses} />
        <UpcomingDeadlinesWidget deadlines={upcomingDeadlines} />
      </div>
    </div>
  );
}
