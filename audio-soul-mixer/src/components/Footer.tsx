import { Music } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-600">
              <span className="text-blue-600 font-medium">Sonic Architect</span> - Music Discovery
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            Discover new music with intelligent recommendations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;