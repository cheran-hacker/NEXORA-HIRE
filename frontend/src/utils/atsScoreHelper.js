/**
 * ATS Score & Resume Preview Utilities for NEXORA Placement Officer
 */

/**
 * Resolves accurate ATS score, analysis state, badge classes, and metadata.
 * Correctly distinguishes genuine 0% from unanalyzed/missing data.
 */
export const getAtsScoreData = (item) => {
  if (!item) {
    return {
      score: null,
      isAnalyzed: false,
      label: "Not analyzed",
      badgeClass: "bg-secondary-subtle text-muted border border-secondary-subtle",
      matchedSkills: [],
      missingSkills: [],
      summary: "",
      type: "none",
    };
  }

  // 1. Check application-level aiAnalysis (Job-specific ATS match)
  const appAts = item.aiAnalysis?.atsScore ?? item.atsScore;
  if (appAts !== undefined && appAts !== null && !isNaN(appAts)) {
    const num = Math.round(Number(appAts));
    const badgeClass =
      num >= 70
        ? "bg-success-subtle text-success border border-success-subtle"
        : num >= 40
        ? "bg-warning-subtle text-warning border border-warning-subtle"
        : "bg-danger-subtle text-danger border border-danger-subtle";

    return {
      score: num,
      isAnalyzed: true,
      label: `${num}%`,
      badgeClass,
      matchedSkills: item.aiAnalysis?.matchedSkills || [],
      missingSkills: item.aiAnalysis?.missingSkills || [],
      summary: item.aiAnalysis?.summary || "",
      type: "job_match",
    };
  }

  // 2. Check candidate-level studentProfile resumeScore or readinessScore
  const student = item.studentId || item.student || {};
  const profile =
    (typeof student === "object" ? student.studentProfile : null) ||
    item.studentProfile ||
    {};
  const profileScore = profile.resumeScore ?? profile.readinessScore;

  if (
    profileScore !== undefined &&
    profileScore !== null &&
    !isNaN(profileScore) &&
    Number(profileScore) > 0
  ) {
    const num = Math.round(Number(profileScore));
    const badgeClass =
      num >= 70
        ? "bg-success-subtle text-success border border-success-subtle"
        : num >= 40
        ? "bg-warning-subtle text-warning border border-warning-subtle"
        : "bg-danger-subtle text-danger border border-danger-subtle";

    return {
      score: num,
      isAnalyzed: true,
      label: `${num}%`,
      badgeClass,
      matchedSkills: [],
      missingSkills: [],
      summary: "",
      type: "profile_ats",
    };
  }

  // 3. Check legacy raw score if it's explicitly non-zero
  if (
    item.score !== undefined &&
    item.score !== null &&
    !isNaN(item.score) &&
    Number(item.score) > 0
  ) {
    const num = Math.round(Number(item.score));
    const badgeClass =
      num >= 70
        ? "bg-success-subtle text-success border border-success-subtle"
        : num >= 40
        ? "bg-warning-subtle text-warning border border-warning-subtle"
        : "bg-danger-subtle text-danger border border-danger-subtle";

    return {
      score: num,
      isAnalyzed: true,
      label: `${num}%`,
      badgeClass,
      matchedSkills: [],
      missingSkills: [],
      summary: "",
      type: "legacy_score",
    };
  }

  // 4. Genuine 0 check: only if aiAnalysis exists with atsScore === 0
  if (item.aiAnalysis && typeof item.aiAnalysis.atsScore === "number") {
    return {
      score: 0,
      isAnalyzed: true,
      label: "0%",
      badgeClass: "bg-danger-subtle text-danger border border-danger-subtle",
      matchedSkills: item.aiAnalysis.matchedSkills || [],
      missingSkills: item.aiAnalysis.missingSkills || [],
      summary: item.aiAnalysis.summary || "",
      type: "job_match",
    };
  }

  // 5. Default: Not analyzed
  return {
    score: null,
    isAnalyzed: false,
    label: "Not analyzed",
    badgeClass: "bg-secondary-subtle text-muted border border-secondary-subtle",
    matchedSkills: [],
    missingSkills: [],
    summary: "",
    type: "none",
  };
};

/**
 * Universal authenticated resume viewer for candidates and applications.
 */
export const viewCandidateResume = async ({
  candidate,
  student,
  addToast,
  onStartLoading,
  onEndLoading,
}) => {
  const targetStudent =
    student ||
    (typeof candidate?.studentId === "object" ? candidate.studentId : null) ||
    candidate;
  const candidateName = targetStudent?.name || candidate?.name || "candidate";
  const studentId =
    targetStudent?._id ||
    (typeof candidate?.studentId === "string" ? candidate.studentId : null);
  const resumeRef =
    candidate?.resumeUrl ||
    targetStudent?.studentProfile?.resumeUrl ||
    targetStudent?.resumeUrl;

  if (!resumeRef || resumeRef === "NONE" || !resumeRef.trim()) {
    if (addToast) {
      addToast(`Resume not uploaded yet for ${candidateName}`, "warning");
    }
    return false;
  }

  // 1. External URL (Cloudinary, AWS S3, Firebase, etc.)
  if (resumeRef.startsWith("http://") || resumeRef.startsWith("https://")) {
    window.open(resumeRef, "_blank", "noopener,noreferrer");
    return true;
  }

  try {
    if (onStartLoading) onStartLoading();
    const token =
      localStorage.getItem("nexora_token") || localStorage.getItem("token");

    // 2. Authenticated endpoint using studentId
    if (studentId) {
      const response = await fetch(
        `/api/placements/students/${studentId}/resume`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        return true;
      }
    }

    // 3. Direct path fallback
    const cleanRef = resumeRef.startsWith("/") ? resumeRef : `/${resumeRef}`;
    const directUrl = cleanRef.startsWith("/uploads")
      ? cleanRef
      : `/uploads/resumes/${cleanRef.replace(/^\//, "")}`;
    window.open(directUrl, "_blank", "noopener,noreferrer");
    return true;
  } catch (err) {
    console.error("Resume preview error:", err);
    if (addToast) {
      addToast(err.message || "Failed to open resume document", "error");
    }
    return false;
  } finally {
    if (onEndLoading) onEndLoading();
  }
};

