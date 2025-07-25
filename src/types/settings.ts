
export interface Settings {
  businessName: string;
  receiptFooter: string;
  theme: 'light' | 'dark';
  location: string;
  shouldApplyTax: boolean;
  authorizedDebtors: Array<{ name: string; phone?: string; limit?: number; notes?: string }>;
  categories: Array<{ id: string; name: string; color?: string }>;
  printDiscountReasons: boolean;
  printNotes: boolean;
}

export const defaultSettings: Settings = {
  businessName: "نورا للمنظفات",
  receiptFooter: "شكراً لزيارتكم - سبها",
  theme: 'light',
  location: "سبها",
  shouldApplyTax: false,
  authorizedDebtors: [],
  categories: [
    { id: "cat1", name: "منظفات" },
    { id: "cat2", name: "معطرات" },
    { id: "cat3", name: "مستلزمات منزلية" },
    { id: "cat4", name: "أخرى" }
  ],
  printDiscountReasons: false,
  printNotes: false
};
