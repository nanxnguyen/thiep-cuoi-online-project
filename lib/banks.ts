export type Bank = { bin: string; name: string };

// BINs from https://api.vietqr.io/v2/banks (transfer-supported banks only).
export const BANKS: readonly Bank[] = [
  { bin: "970436", name: "Vietcombank" },
  { bin: "970415", name: "VietinBank" },
  { bin: "970418", name: "BIDV" },
  { bin: "970405", name: "Agribank" },
  { bin: "970407", name: "Techcombank" },
  { bin: "970422", name: "MB Bank" },
  { bin: "970416", name: "ACB" },
  { bin: "970432", name: "VPBank" },
  { bin: "970423", name: "TPBank" },
  { bin: "970403", name: "Sacombank" },
  { bin: "970437", name: "HDBank" },
  { bin: "970441", name: "VIB" },
  { bin: "970443", name: "SHB" },
  { bin: "970448", name: "OCB" },
  { bin: "970426", name: "MSB" },
  { bin: "970440", name: "SeABank" },
  { bin: "970449", name: "LPBank" },
  { bin: "970431", name: "Eximbank" },
  { bin: "970429", name: "SCB" },
  { bin: "970428", name: "Nam A Bank" },
  { bin: "970409", name: "Bac A Bank" },
  { bin: "970425", name: "ABBank" },
  { bin: "970412", name: "PVcomBank" },
  { bin: "970419", name: "NCB" },
  { bin: "970427", name: "VietABank" },
  { bin: "970438", name: "BaoViet Bank" },
  { bin: "970452", name: "KienlongBank" },
  { bin: "970454", name: "Bản Việt (VietCapitalBank)" },
  { bin: "963388", name: "Timo" },
  { bin: "546034", name: "CAKE by VPBank" },
  { bin: "546035", name: "Ubank by VPBank" },
];

export const bankName = (bin: string): string => BANKS.find((b) => b.bin === bin)?.name ?? bin;
