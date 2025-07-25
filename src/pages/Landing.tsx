
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  ShoppingBag, 
  Package, 
  BarChart, 
  Settings, 
  CreditCard, 
  FileText, 
  Moon, 
  Sun, 
  RefreshCw, 
  Clock
} from "lucide-react";

interface LandingProps {
  onComplete: () => void;
}

const Landing: React.FC<LandingProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  
  // إنشاء تأثير بقع الألوان
  const colorSpots = [
    { color: "bg-blue-500", size: "w-64 h-64", top: "top-20", left: "left-10" },
    { color: "bg-purple-500", size: "w-72 h-72", top: "top-40", right: "right-10" },
    { color: "bg-pink-500", size: "w-48 h-48", bottom: "bottom-20", left: "left-20" },
    { color: "bg-cyan-500", size: "w-56 h-56", bottom: "bottom-10", right: "right-20" },
  ];
  
  // محاكاة تقدم التحميل
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(timer);
        }
        return newProgress;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, []);
  
  // الانتقال التلقائي بعد إكمال التحميل
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        // Don't automatically complete to give user time to read features
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  // Features list
  const features = [
    { icon: <ShoppingBag />, title: "نقطة البيع", description: "إدارة المبيعات بطريقة سهلة" },
    { icon: <Package />, title: "إدارة المخزون", description: "تتبع المنتجات والكميات" },
    { icon: <BarChart />, title: "التقارير والإحصائيات", description: "تحليل الأداء والمبيعات" },
    { icon: <CreditCard />, title: "نظام الديون", description: "تسجيل وإدارة المبيعات بالدين" },
    { icon: <FileText />, title: "الفواتير", description: "إنشاء وطباعة فواتير احترافية" },
    { icon: <Moon />, title: "الوضع الليلي", description: "وضع مريح للعين في الإضاءة المنخفضة" },
    { icon: <RefreshCw />, title: "النسخ الاحتياطي", description: "حفظ واسترجاع بيانات النظام" },
    { icon: <Clock />, title: "جرد نهاية الدوام", description: "محاسبة وتتبع المبيعات اليومية" },
  ];
  
  return (
    <div className={`landing-container ${theme}`}>
      {/* بقع الألوان */}
      {colorSpots.map((spot, index) => (
        <div
          key={index}
          className={`color-spot ${spot.color} ${theme === 'dark' ? 'opacity-10' : 'opacity-20'} ${spot.size} ${spot.top} ${spot.left || ''} ${spot.right || ''} ${spot.bottom || ''}`}
        />
      ))}
      
      <div className="landing-content glass p-8 md:p-10 rounded-2xl max-w-4xl w-full">
        <h1 className="landing-title">نظام نورا للمنظفات</h1>
        <p className="landing-subtitle">حل متكامل لإدارة نقاط البيع والمخزون والمبيعات</p>
        
        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {progress >= 100 && (
          <>
            <div className="mt-8 mb-12">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">مميزات النظام</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold dark:text-white">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              className="landing-cta"
              onClick={onComplete}
            >
              انتقل إلى التطبيق
            </Button>
          </>
        )}
        
        {progress < 100 && (
          <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
            <p className="dark:text-white">جاري التحميل... {progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
