import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, CheckCircle2, Bot, Plus, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import * as api from "../lib/tauri";
import type { ManagedSkill } from "../lib/tauri";
import { getScenarioIconOption } from "../lib/scenarioIcons";

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeScenario, tools } = useApp();
  const [skills, setSkills] = useState<ManagedSkill[]>([]);

  const installed = tools.filter((t) => t.installed).length;
  const total = tools.length;
  const synced = skills.filter((s) => s.targets.length > 0).length;
  const scenarioIcon = getScenarioIconOption(activeScenario);
  const ScenarioIcon = scenarioIcon.icon;

  useEffect(() => {
    if (activeScenario) {
      api.getSkillsForScenario(activeScenario.id).then(setSkills).catch(() => { });
    }
  }, [activeScenario]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-[16px] font-semibold text-primary mb-1.5">
          {t("dashboard.greeting")}
        </h1>
        <p className="text-[13px] text-tertiary flex items-center gap-2 flex-wrap">
          {t("dashboard.currentScenario")}：
          <span
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[12px] font-medium ${scenarioIcon.activeClass} ${scenarioIcon.colorClass}`}
          >
            <ScenarioIcon className="h-3 w-3" />
            {activeScenario?.name || "—"}
          </span>
          <span className="text-faint">·</span>
          <span>{t("dashboard.skillsEnabled", { count: skills.length })}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3.5">
        {[
          {
            title: t("dashboard.scenarioSkills"),
            value: String(skills.length),
            icon: Layers,
            color: "text-accent-light",
            bg: "bg-accent-bg",
          },
          {
            title: t("dashboard.synced"),
            value: String(synced),
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/[0.08]",
          },
          {
            title: t("dashboard.supportedAgents"),
            value: `${installed}/${total}`,
            icon: Bot,
            color: "text-amber-400",
            bg: "bg-amber-500/[0.08]",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 rounded-lg bg-surface border border-border-subtle hover:border-border transition-colors"
            >
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-[0.08em] mb-1">
                  {stat.title}
                </p>
                <h3 className="text-xl font-semibold text-primary leading-none">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-md ${stat.bg} ${stat.color} border border-border-subtle`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/install?tab=local")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-dark hover:bg-accent text-white text-[13px] font-medium transition-colors outline-none"
        >
          <Download className="w-4 h-4" />
          {t("dashboard.scanImport")}
        </button>
        <button
          onClick={() => navigate("/install")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-hover hover:bg-surface-active text-secondary text-[13px] font-medium transition-colors border border-border outline-none"
        >
          <Plus className="w-4 h-4 text-tertiary" />
          {t("dashboard.installNew")}
        </button>
      </div>

      {/* Recent skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.08em] mb-2.5">
            {t("dashboard.recentActivity")}
          </h2>
          <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle">
            {skills.slice(0, 5).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[11px] font-semibold bg-accent-bg text-accent-light shrink-0">
                    {skill.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-[12px] text-secondary font-medium flex items-center gap-1.5">
                      {skill.name}
                      <span className="text-[9px] px-1.5 py-px rounded bg-surface-hover text-muted border border-border font-normal">
                        {skill.source_type}
                      </span>
                    </h4>
                    <p className="text-[11px] text-muted mt-px">
                      {skill.targets.length > 0
                        ? `${t("dashboard.synced")} → ${skill.targets.map((t) => t.tool).join(", ")}`
                        : "未同步"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
