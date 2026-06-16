import ConfessionForm from "@/components/ConfessionForm";

export default function ConfessPage() {
  return (
    <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="font-display-lg text-display-lg text-on-background mb-4">
          Bagikan Ceritamu
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Ini adalah ruang yang aman dan tanpa penghakiman. Tulis apa yang
          kamu rasakan, pilih font yang mewakili perasaanmu, dan biarkan dunia
          mendengarkan dalam diam.
        </p>
      </div>

      {/* Confession Form */}
      <ConfessionForm />
    </div>
  );
}