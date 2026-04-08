import DistrictPriceTable from '@/components/DistrictPriceTable';

export default function PriceTable() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="app-container">
        <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-[48rem] text-center">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              Bezirke
            </p>
            <h2 className="mt-3 text-[2rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.45rem]">
              Fixpreis-Uebersicht fuer alle Wiener Bezirke
            </h2>
            <p className="mt-4 text-[1rem] leading-[1.75] text-[#5f6975]">
              Alle Preise inkl. MwSt. zum oder vom Flughafen Wien.
            </p>
          </div>

          <DistrictPriceTable />
        </div>
      </div>
    </section>
  );
}
