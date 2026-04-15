import { Construction } from 'lucide-react';

interface GenericPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function GenericPage({ title, description, icon }: GenericPageProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description || `Manage ${title.toLowerCase()} here`}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          {icon || <Construction size={28} className="text-blue-600" />}
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          This section is ready for your content. Build out the {title} functionality here.
        </p>
        <button className="mt-5 bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}
