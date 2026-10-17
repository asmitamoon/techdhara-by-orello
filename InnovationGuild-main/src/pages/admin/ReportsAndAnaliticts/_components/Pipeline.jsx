import { useGetAdminPipelineStats } from '../../../../hooks/queries/admin';

function buildItems(pipeline) {
  if (!pipeline) return [
    { label: "Registered",        value: 0, pct: 100.0, barColor: "bg-gray-300",  textColor: "text-gray-700"  },
    { label: "Mapped to Problems", value: 0, pct: 0,    barColor: "bg-blue-300",  textColor: "text-blue-700"  },
    { label: "Under Trial",        value: 0, pct: 0,    barColor: "bg-blue-500",  textColor: "text-white"     },
    { label: "Implemented",        value: 0, pct: 0,    barColor: "bg-green-500", textColor: "text-white"     },
    { label: "No Activity",        value: 0, pct: 0,    barColor: "bg-red-500",   textColor: "text-white"     },
  ];
  const total = pipeline.registered || 1;
  const pct = (v) => +((v / total) * 100).toFixed(1);
  return [
    { label: "Registered",         value: pipeline.registered,       pct: 100,                           barColor: "bg-gray-300",  textColor: "text-gray-700" },
    { label: "Mapped to Problems",  value: pipeline.mappedToProblems, pct: pct(pipeline.mappedToProblems), barColor: "bg-blue-300",  textColor: "text-blue-700" },
    { label: "Under Trial",         value: pipeline.underTrial,       pct: pct(pipeline.underTrial),       barColor: "bg-blue-500",  textColor: "text-white"    },
    { label: "Implemented",         value: pipeline.implemented,      pct: pct(pipeline.implemented),      barColor: "bg-green-500", textColor: "text-white"    },
    { label: "No Activity",         value: pipeline.noActivity,       pct: pct(pipeline.noActivity),       barColor: "bg-red-500",   textColor: "text-white"    },
  ];
}

const PipelineBar = ({ item }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{item.label}</span>
      <span className="text-sm text-gray-500">{item.value} ({item.pct}%)</span>
    </div>
    <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
      <div
        className={`h-full ${item.barColor} rounded-lg flex items-center px-3 transition-all`}
        style={{ width: `${item.pct}%` }}
      >
        <span className={`text-sm font-semibold ${item.textColor}`}>{item.value}</span>
      </div>
    </div>
  </div>
);

export default function InnovationPipeline() {
  const { data, isLoading } = useGetAdminPipelineStats();
  const items = buildItems(data?.data);

  return (
    <>
      <h2 className="text-3xl font-regular text-[#273228] mt-10 mb-6">Innovation Pipeline</h2>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 bg-white border border-accent-green-light rounded-2xl p-6 flex flex-col gap-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))
          ) : (
            items.map((item) => (
              <PipelineBar key={item.label} item={item} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
