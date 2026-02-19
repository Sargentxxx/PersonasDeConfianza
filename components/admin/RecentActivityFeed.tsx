"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface ActivityItem {
  id: string;
  type: "user_signup" | "new_request" | "dispute" | "verification";
  title: string;
  description: string;
  timestamp: Date;
}

const RecentActivityFeed = ({ activities }: { activities: ActivityItem[] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return "person_add";
      case "new_request":
        return "task";
      case "dispute":
        return "warning";
      case "verification":
        return "verified_user";
      default:
        return "notifications";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "user_signup":
        return "bg-blue-100 text-blue-600";
      case "new_request":
        return "bg-green-100 text-green-600";
      case "dispute":
        return "bg-red-100 text-red-600";
      case "verification":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
        Actividad Reciente
      </h3>
      {activities.length === 0 ? (
        <p className="text-slate-500 text-sm italic">
          No hay actividad reciente.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 items-start">
              <div className={`p-2 rounded-full ${getColor(activity.type)}`}>
                <span className="material-symbols-outlined text-sm">
                  {getIcon(activity.type)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500">{activity.description}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
