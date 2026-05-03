import { School, SchoolIndex } from "./types";
import { getTierFromIndex } from "./utils";

// Tipe status per penerima
export type RecipientStatus =
  | "pending"      // belum dikirim
  | "sent"         // sudah dikirim, belum dibalas
  | "replied"      // sudah dibalas
  | "escalate";    // belum dibalas > threshold

// Satu pesan dalam thread email
export interface EmailMessage {
  from: "system" | "recipient";
  senderName: string;
  timestamp: string;    // format: "3 Mei 2026, 09:10"
  body: string;
  isAuto?: boolean;     // true = pesan otomatis dari agent
}

// Satu penerima email
export interface StakeholderRecipient {
  id: string;
  role: string;           // "Kepala Sekolah", "Lurah", "Camat", dll
  name: string;           // nama dummy
  email: string;          // email dummy
  level: "sekolah" | "kelurahan" | "kecamatan" | "kota" | "provinsi";
  status: RecipientStatus;
  sentAt?: string;
  repliedAt?: string;
  thread: EmailMessage[];
}

// Generate daftar penerima dummy berdasarkan data sekolah
export function generateStakeholders(
  school: School,
  schoolIndex: SchoolIndex
): StakeholderRecipient[] {
  const schoolName = school.school_name;
  const kecamatan = school.kecamatan;
  const kelurahan = school.kelurahan;
  const kota = school.kota ?? "Jakarta";

  // Ringkasan untuk isi email
  const tier = getTierFromIndex(schoolIndex.sigapp_index);
  const tierLabel =
    tier === 'KRITIS' ? "Prioritas Kritis" :
    tier === 'TINGGI' ? "Prioritas Tinggi" :
    tier === 'SEDANG' ? "Prioritas Sedang" : "Prioritas Rendah";

  const emailBody = (recipientRole: string) =>
    `Yth. ${recipientRole},\n\nBersama ini kami sampaikan laporan kondisi ${schoolName} ` +
    `berdasarkan analisis SIGAPP Index. Sekolah ini masuk dalam kategori ${tierLabel} ` +
    `dengan SIGAPP Index ${schoolIndex.sigapp_index.toFixed(3)}.\n\n` +
    `Terlampir laporan lengkap kondisi sekolah dan rekomendasi tindak lanjut.\n\n` +
    `Mohon kiranya dapat ditindaklanjuti sesuai kewenangan Bapak/Ibu.\n\n` +
    `Hormat kami,\nSIGAPP System — Sistem Informasi GIS Prioritas Pendidikan`;

  const followUpBody =
    `Menindaklanjuti laporan yang kami kirimkan sebelumnya, kami ingin menanyakan ` +
    `apakah sudah ada tindak lanjut terkait kondisi ${schoolName}? ` +
    `Kami siap memberikan data tambahan jika diperlukan.`;

  return [
    {
      id: "ks",
      role: "Kepala Sekolah",
      name: `Kepala ${schoolName}`,
      email: `kepala.${schoolName.toLowerCase().replace(/\s+/g, ".")}@disdik.jakarta.go.id`,
      level: "sekolah",
      status: "replied",
      sentAt: "2 Mei 2026, 14:35",
      repliedAt: "2 Mei 2026, 16:20",
      thread: [
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 14:35",
          body: emailBody("Kepala Sekolah"),
        },
        {
          from: "recipient",
          senderName: `Kepala ${schoolName}`,
          timestamp: "2 Mei 2026, 16:20",
          body: "Terima kasih atas laporannya. Sudah kami terima dan sedang kami koordinasikan dengan komite sekolah untuk tindak lanjut lebih lanjut.",
        },
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 16:25",
          body: "Terima kasih atas respons Bapak/Ibu. Apakah ada tindak lanjut konkret yang dapat kami catat dalam sistem? Tim kami siap memberikan data tambahan jika diperlukan.",
          isAuto: true,
        },
      ],
    },
    {
      id: "lurah",
      role: `Lurah ${kelurahan}`,
      name: `Lurah ${kelurahan}`,
      email: `lurah.${kelurahan.toLowerCase().replace(/\s+/g, "")}@jakarta.go.id`,
      level: "kelurahan",
      status: "sent",
      sentAt: "2 Mei 2026, 14:35",
      thread: [
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 14:35",
          body: emailBody(`Lurah ${kelurahan}`),
        },
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "4 Mei 2026, 08:00",
          body: followUpBody,
          isAuto: true,
        },
      ],
    },
    {
      id: "camat",
      role: `Camat ${kecamatan}`,
      name: `Camat ${kecamatan}`,
      email: `camat.${kecamatan.toLowerCase().replace(/\s+/g, "")}@jakarta.go.id`,
      level: "kecamatan",
      status: "replied",
      sentAt: "2 Mei 2026, 14:35",
      repliedAt: "3 Mei 2026, 09:10",
      thread: [
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 14:35",
          body: emailBody(`Camat ${kecamatan}`),
        },
        {
          from: "recipient",
          senderName: `Camat ${kecamatan}`,
          timestamp: "3 Mei 2026, 09:10",
          body: "Sudah kami catat. Akan kami masukkan ke agenda rapat koordinasi mingguan dengan kepala wilayah terkait.",
        },
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "3 Mei 2026, 09:15",
          body: "Terima kasih atas respons Bapak/Ibu Camat. Kami akan memantau perkembangannya dan siap memberikan dukungan data jika diperlukan.",
          isAuto: true,
        },
      ],
    },
    {
      id: "kadis",
      role: `Kepala Dinas Pendidikan ${kota}`,
      name: `Kepala Disdik ${kota}`,
      email: `kadisdik@disdik.jakarta.go.id`,
      level: "kota",
      status: "escalate",
      sentAt: "2 Mei 2026, 14:35",
      thread: [
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 14:35",
          body: emailBody(`Kepala Dinas Pendidikan ${kota}`),
        },
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "4 Mei 2026, 08:00",
          body: followUpBody,
          isAuto: true,
        },
      ],
    },
    {
      id: "bappeda",
      role: "Bappeda Provinsi DKI Jakarta",
      name: "Kepala Bappeda Provinsi",
      email: "bappeda@jakarta.go.id",
      level: "provinsi",
      status: "replied",
      sentAt: "2 Mei 2026, 14:35",
      repliedAt: "3 Mei 2026, 08:45",
      thread: [
        {
          from: "system",
          senderName: "SIGAPP System",
          timestamp: "2 Mei 2026, 14:35",
          body: emailBody("Kepala Bappeda Provinsi DKI Jakarta"),
        },
        {
          from: "recipient",
          senderName: "Bappeda Provinsi DKI",
          timestamp: "3 Mei 2026, 08:45",
          body: "Laporan telah diterima dan akan dimasukkan ke dalam pertimbangan prioritas RPJMD bidang pendidikan. Terima kasih atas data yang komprehensif.",
        },
      ],
    },
  ];
}
