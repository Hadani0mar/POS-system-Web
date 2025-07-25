
import html2pdf from "html2pdf.js";
import { Settings, defaultSettings } from "@/types/settings";
import { Sale, ShiftReport } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers";

// Improved receipt generator
export const generateReceipt = (sale: Sale, businessName?: string, receiptFooter?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Get settings from localStorage or use defaults
      const settings = (() => {
        const savedSettings = localStorage.getItem("settings");
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
      })();
      
      const companyName = businessName || settings.businessName;
      const footer = receiptFooter || settings.receiptFooter;
      const applyTax = settings.shouldApplyTax;
      const printDiscountReasons = settings.printDiscountReasons || false;
      const printNotes = settings.printNotes || false;
      
      const container = document.createElement("div");
      container.className = "receipt-container rtl p-4";
      
      const content = `
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold">${companyName}</h2>
          <p class="text-sm">${settings.location || ""}</p>
          <p class="text-sm">${formatDate(sale.createdAt)}</p>
          <p class="text-sm">فاتورة رقم: ${sale.id}</p>
        </div>
        
        <div class="border-t border-b py-2 my-2">
          ${sale.customerName ? `<p class="text-sm">العميل: ${sale.customerName}</p>` : ''}
          ${sale.customerPhone ? `<p class="text-sm">رقم الهاتف: ${sale.customerPhone}</p>` : ''}
          ${sale.isDebt ? `<p class="text-sm font-bold">نوع البيع: دين</p>` : ''}
        </div>
        
        <table class="w-full text-right text-sm">
          <thead>
            <tr>
              <th class="py-1">المنتج</th>
              <th class="py-1">الكمية</th>
              <th class="py-1">السعر</th>
              <th class="py-1">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td class="py-1">${item.product.name}</td>
                <td class="py-1">${item.quantity}</td>
                <td class="py-1">${formatCurrency(item.product.price)}</td>
                <td class="py-1">${formatCurrency(item.product.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="border-t mt-2 pt-2">
          <div class="flex justify-between">
            <span>المجموع:</span>
            <span>${formatCurrency(sale.total)}</span>
          </div>
          ${sale.discount > 0 ? `
            <div class="flex justify-between">
              <span>الخصم:</span>
              <span>${formatCurrency(sale.discount)}</span>
            </div>
            ${printDiscountReasons && sale.discountReason ? `
              <div class="flex justify-between text-xs">
                <span>سبب الخصم:</span>
                <span>${sale.discountReason}</span>
              </div>
            ` : ''}
          ` : ''}
          ${applyTax && sale.tax > 0 ? `
            <div class="flex justify-between">
              <span>الضريبة (${sale.tax}%):</span>
              <span>${formatCurrency((sale.total - sale.discount) * sale.tax / 100)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between font-bold border-t pt-1 mt-1">
            <span>الإجمالي:</span>
            <span>${formatCurrency(sale.finalTotal)}</span>
          </div>
          <div class="flex justify-between">
            <span>طريقة الدفع:</span>
            <span>${sale.paymentMethod === 'cash' ? 'نقدي' : sale.paymentMethod === 'card' ? 'بطاقة' : 'دين'}</span>
          </div>
          ${printNotes && sale.notes ? `
            <div class="mt-2 text-xs">
              <p>ملاحظات: ${sale.notes}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="text-center mt-4 text-sm">
          <p>${footer}</p>
        </div>
      `;
      
      container.innerHTML = content;
      document.body.appendChild(container);
      
      const options = {
        margin: [0, 0, 0, 0],
        filename: `فاتورة_${sale.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: [80, 150], orientation: 'portrait' }
      };
      
      // Use html2pdf directly without then/catch
      html2pdf()
        .from(container)
        .set(options)
        .save()
        .then(() => {
          document.body.removeChild(container);
          resolve();
        })
        .catch(error => {
          document.body.removeChild(container);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate a shift report PDF
export const generateShiftReport = (report: ShiftReport): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement("div");
      container.className = "report-container rtl p-4";
      
      // Get settings from localStorage or use defaults
      const settings = (() => {
        const savedSettings = localStorage.getItem("settings");
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
      })();
      
      const content = `
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold">${settings.businessName}</h2>
          <p class="text-sm">${settings.location || ""}</p>
          <h3 class="text-lg font-bold mt-4">تقرير نهاية الدوام</h3>
          <p class="text-sm">${formatDate(report.date)}</p>
        </div>
        
        <div class="border-t border-b py-2 my-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="font-bold">عدد المبيعات:</p>
              <p>${report.salesCount}</p>
            </div>
            <div>
              <p class="font-bold">إجمالي المبيعات:</p>
              <p>${formatCurrency(report.totalSales)}</p>
            </div>
          </div>
        </div>
        
        <table class="w-full text-right my-4">
          <tr>
            <td class="font-bold py-1">المبيعات النقدية:</td>
            <td class="py-1">${formatCurrency(report.totalCashSales)}</td>
          </tr>
          <tr>
            <td class="font-bold py-1">مبيعات البطاقات:</td>
            <td class="py-1">${formatCurrency(report.totalCardSales)}</td>
          </tr>
          <tr>
            <td class="font-bold py-1">مبيعات الدين:</td>
            <td class="py-1">${formatCurrency(report.totalDebtSales)}</td>
          </tr>
          <tr>
            <td class="font-bold py-1">النقد في الصندوق:</td>
            <td class="py-1">${formatCurrency(report.cashInDrawer)}</td>
          </tr>
          <tr>
            <td class="font-bold py-1">الفرق (${report.cashShortage >= 0 ? 'فائض' : 'عجز'}):</td>
            <td class="py-1">${formatCurrency(Math.abs(report.cashShortage))}</td>
          </tr>
          ${report.expenses ? `
          <tr>
            <td class="font-bold py-1">مصروفات المحل:</td>
            <td class="py-1">${formatCurrency(report.expenses)}</td>
          </tr>
          ` : ''}
        </table>
        
        ${report.notes ? `
          <div class="border-t pt-2 mt-2">
            <p class="font-bold">ملاحظات:</p>
            <p>${report.notes}</p>
          </div>
        ` : ''}
      `;
      
      container.innerHTML = content;
      document.body.appendChild(container);
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: `تقرير_نهاية_الدوام_${new Date(report.date).toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Use html2pdf directly without then/catch
      html2pdf()
        .from(container)
        .set(options)
        .save()
        .then(() => {
          document.body.removeChild(container);
          resolve();
        })
        .catch(error => {
          document.body.removeChild(container);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};
