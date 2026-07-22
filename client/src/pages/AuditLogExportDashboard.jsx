import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Header from "../components/layout/Header.jsx";
import StatCard from "../components/audit-exports/StatCard.jsx";
import ExportHistoryTable from "../components/audit-exports/ExportHistoryTable.jsx";
import TriggerExportModal from "../components/audit-exports/TriggerExportModal.jsx";
import TriggerDryRunModal from "../components/audit-exports/TriggerDryRunModal.jsx";
import DryRunSuccessBanner from "../components/audit-exports/DryRunSuccessBanner.jsx";
import {
  getExportStatus,
  triggerExport,
  getExportConfig,
  updateExportConfig,
  triggerDryRun,
} from "../services/api.js";

export default function AuditLogExportDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState(null);
  const [triggerSuccess, setTriggerSuccess] = useState(null);

  // Dry-run state
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunError, setDryRunError] = useState(null);
  const [dryRunSuccess, setDryRunSuccess] = useState(null);
  const [dryRunEntriesProcessed, setDryRunEntriesProcessed] = useState(null);
  const [showDryRunBanner, setShowDryRunBanner] = useState(false);

  // Config form state
  const [bucketName, setBucketName] = useState("");
  const [encryptionStandard, setEncryptionStandard] = useState("AES-256");
  const [retentionDays, setRetentionDays] = useState(2555);
  const [scheduleCron, setScheduleCron] = useState("0 1 * * *");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [configSuccess, setConfigSuccess] = useState(null);

  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const data = await getExportStatus();
      setStatusData(data);
    } catch (err) {
      console.error("Failed to fetch export status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const data = await getExportConfig();
      setConfigData(data);
      setBucketName(data.gcs_bucket_name);
      setEncryptionStandard(data.encryption_standard);
      setRetentionDays(data.retention_days);
      setScheduleCron(data.schedule_cron);
    } catch (err) {
      console.error("Failed to fetch export config:", err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchConfig();
  }, []);

  const handleTriggerExport = async () => {
    try {
      setIsTriggering(true);
      setTriggerError(null);
      setTriggerSuccess(null);
      const result = await triggerExport();
      setTriggerSuccess(result.message || "Export job triggered successfully.");
      // Refresh status after a short delay
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to trigger export.";
      setTriggerError(errMsg);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleTriggerDryRun = async () => {
    try {
      setIsDryRunning(true);
      setDryRunError(null);
      setDryRunSuccess(null);
      setDryRunEntriesProcessed(null);
      const result = await triggerDryRun();
      setDryRunSuccess(
        result.message || "Dry-run simulation completed successfully.",
      );
      setDryRunEntriesProcessed(result.entries_processed);
      setShowDryRunBanner(true);
      // Refresh status after a short delay
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to trigger dry-run.";
      setDryRunError(errMsg);
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      setConfigError(null);
      setConfigSuccess(null);
      const updated = await updateExportConfig({
        gcs_bucket_name: bucketName,
        encryption_standard: encryptionStandard,
        retention_days: parseInt(retentionDays, 10),
        schedule_cron: scheduleCron,
      });
      setConfigData(updated);
      setConfigSuccess("Configuration updated successfully.");
      // Refresh status to update next scheduled run countdown
      fetchStatus();
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to update configuration.";
      setConfigError(errMsg);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const formatCountdown = (nextRunStr) => {
    if (!nextRunStr) return "In 18 hours 55 minutes";
    try {
      const nextRun = new Date(nextRunStr);
      const diffMs = nextRun - new Date();
      if (diffMs < 0) return "Scheduled run imminent";
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `In ${diffHrs} hours ${diffMins} minutes`;
    } catch (e) {
      return "In 18 hours 55 minutes";
    }
  };

  const formatLastRunDate = (lastRun) => {
    if (!lastRun || !lastRun.started_at) return "2026-01-01 01:05 UTC";
    try {
      const date = new Date(lastRun.started_at);
      return date.toISOString().replace("T", " ").substring(0, 16) + " UTC";
    } catch (e) {
      return "2026-01-01 01:05 UTC";
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="ml-[260px] mt-[64px] p-6 min-h-[calc(100vh-64px)]">
        {activeTab === "dashboard" && (
          <>
            {showDryRunBanner && (
              <DryRunSuccessBanner
                message={dryRunSuccess}
                entriesProcessed={dryRunEntriesProcessed}
                onClose={() => setShowDryRunBanner(false)}
              />
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
                  Audit Log Export Dashboard
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
                  Monitor and manage automated daily encrypted exports of system
                  audit logs to external GCS bucket.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setDryRunError(null);
                    setDryRunSuccess(null);
                    setDryRunEntriesProcessed(null);
                    setIsDryRunModalOpen(true);
                  }}
                  className="border border-secondary text-secondary hover:bg-secondary/10 px-6 py-2.5 rounded-lg font-body-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined">science</span>
                  Trigger Dry-Run
                </button>
                <button
                  onClick={() => {
                    setTriggerError(null);
                    setTriggerSuccess(null);
                    setIsTriggerModalOpen(true);
                  }}
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg font-body-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>
                  Trigger Export Now
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Last Run Status"
                value={statusData?.last_run?.status || "SUCCESS"}
                subtext={
                  statusData?.last_run?.file_name ||
                  "audit_log_2026-01-01.csv.enc"
                }
                badgeText={statusData?.last_run?.status || "SUCCESS"}
                badgeType="success"
                footerLabel="File Size"
                footerValue={`${statusData?.last_run?.file_size_mb || "5.4"} MB`}
                icon="cloud_done"
              />

              <StatCard
                title="Next Scheduled Run"
                value={
                  statusData?.next_run_scheduled_at
                    ? new Date(statusData.next_run_scheduled_at)
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 16) + " UTC"
                    : "2026-01-02 01:00 UTC"
                }
                subtext={`Countdown: ${formatCountdown(statusData?.next_run_scheduled_at)}`}
                icon="schedule"
              />

              <StatCard
                title="Retention Policy"
                value={`${configData?.retention_days ? Math.round(configData.retention_days / 365) : "7"} Years`}
                subtext={`Purge > ${configData?.retention_days || "2555"} days`}
                footerLabel="Storage Tier"
                footerValue="Coldline"
                icon="folder_special"
              />

              <StatCard
                title="Encryption Standard"
                value={configData?.encryption_standard || "AES-256"}
                subtext="Key managed via Secret Manager"
                footerLabel="Key Rotation"
                footerValue="Automated"
                icon="enhanced_encryption"
              />
            </div>

            {/* Job History Table Section */}
            <ExportHistoryTable
              history={statusData?.history || []}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === "export-settings" && (
          <div className="max-w-3xl">
            <div className="mb-8">
              <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
                Export Settings (Admin)
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                Configure the automated daily encrypted exports of system audit
                logs.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <form onSubmit={handleSaveConfig} className="flex flex-col gap-6">
                {configSuccess && (
                  <div className="bg-primary/10 border border-primary/30 text-primary p-4 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-outlined shrink-0">
                      check_circle
                    </span>
                    <p className="text-sm">{configSuccess}</p>
                  </div>
                )}

                {configError && (
                  <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-outlined shrink-0">
                      error
                    </span>
                    <p className="text-sm">{configError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface">
                    GCS Bucket Name
                  </label>
                  <input
                    type="text"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg py-2.5 px-4 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. enterprise-audit-logs-bucket"
                    required
                  />
                  <p className="text-xs text-on-surface-variant">
                    The external Google Cloud Storage bucket where encrypted
                    logs will be uploaded.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface">
                    Encryption Standard
                  </label>
                  <select
                    value={encryptionStandard}
                    onChange={(e) => setEncryptionStandard(e.target.value)}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg py-2.5 px-4 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="AES-256">AES-256 (Recommended)</option>
                    <option value="AES-192">AES-192</option>
                    <option value="AES-128">AES-128</option>
                  </select>
                  <p className="text-xs text-on-surface-variant">
                    The symmetric encryption standard used to secure the
                    exported log files.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface">
                    Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg py-2.5 px-4 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. 2555"
                    required
                  />
                  <p className="text-xs text-on-surface-variant">
                    Number of days to retain logs in the external bucket before
                    purging (e.g., 2555 days = 7 years).
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface">
                    Schedule Cron Expression
                  </label>
                  <input
                    type="text"
                    value={scheduleCron}
                    onChange={(e) => setScheduleCron(e.target.value)}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg py-2.5 px-4 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. 0 1 * * *"
                    required
                  />
                  <p className="text-xs text-on-surface-variant">
                    Standard cron expression defining when the automated export
                    job runs (default: daily at 01:00 UTC).
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
                  <button
                    type="button"
                    onClick={fetchConfig}
                    className="px-5 py-2.5 bg-[#334155] hover:bg-[#475569] text-on-surface rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary-container rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSavingConfig ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          sync
                        </span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          save
                        </span>
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {["audit-logs", "access-control", "settings"].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
              construction
            </span>
            <h3 className="text-xl font-semibold text-on-surface mb-2">
              Under Construction
            </h3>
            <p className="text-on-surface-variant text-sm max-w-md">
              The {activeTab.replace("-", " ")} module is currently being
              configured. Please check back later.
            </p>
          </div>
        )}
      </main>

      <TriggerExportModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        onConfirm={handleTriggerExport}
        isLoading={isTriggering}
        error={triggerError}
        successMessage={triggerSuccess}
      />

      <TriggerDryRunModal
        isOpen={isDryRunModalOpen}
        onClose={() => setIsDryRunModalOpen(false)}
        onConfirm={handleTriggerDryRun}
        isLoading={isDryRunning}
        error={dryRunError}
        successMessage={dryRunSuccess}
        entriesProcessed={dryRunEntriesProcessed}
      />
    </div>
  );
}
