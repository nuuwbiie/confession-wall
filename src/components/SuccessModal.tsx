"use client";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md soft-shadow border border-outline-variant/10 animate-fadeIn mx-2 p-8 md:p-10 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary-container/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl md:text-5xl text-secondary">
            check_circle
          </span>
        </div>

        {/* Title */}
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
          Cerita Berhasil Dikirim! 🎉
        </h2>

        {/* Message */}
        <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
          Terima kasih sudah berbagi cerita. Setiap cerita akan melalui proses
          moderasi terlebih dahulu sebelum ditampilkan di Wall.
        </p>

        {/* Info Card */}
        <div className="bg-surface-container-low rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-sm text-primary mt-0.5">
              info
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Moderasi dilakukan untuk menjaga kenyamanan bersama. Jika ceritamu
              sesuai dengan pedoman, cerita akan tampil dalam waktu 1×24 jam.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
