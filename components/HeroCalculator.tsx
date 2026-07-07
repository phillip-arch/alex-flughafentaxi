'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Check, ChevronDown, Plane, ShieldCheck, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/ContactIcons';
import { districtPricingRows, getDistrictPrice, type VehicleType as DistrictVehicleType } from '@/lib/pricing/districtPricing';

const districts = districtPricingRows.map((district, index) => ({
  label: `${index + 1}. ${district.name} · ${district.id}`,
  value: district.id,
  group: district.group,
}));

const vehicles = [
  { title: 'Limousine', value: 'limousine', priceType: 'limo', people: '1 - 3', bags: '2' },
  { title: 'Kombi', value: 'kombi', priceType: 'kombi', people: '1 - 4', bags: '4', badge: 'BELIEBT' },
  { title: 'Van', value: 'van', priceType: 'van', people: '8', bags: '8' },
] satisfies Array<{
  title: string;
  value: string;
  priceType: DistrictVehicleType;
  people: string;
  bags: string;
  badge?: string;
}>;

function PriceFlipTile({
  value,
  previousValue = value,
  flipToken = 0,
  delay = 0,
  shouldFlip = false,
}: {
  value: string;
  previousValue?: string;
  flipToken?: number;
  delay?: number;
  shouldFlip?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [fromValue, setFromValue] = useState(previousValue);
  const [toValue, setToValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (!shouldFlip) {
      setDisplayValue(value);
      setFromValue(value);
      setToValue(value);
      setIsFlipping(false);
      return;
    }

    setFromValue(previousValue);
    setToValue(value);
    setIsFlipping(false);

    const startTimeout = window.setTimeout(() => {
      setFlipKey((key) => key + 1);
      setIsFlipping(true);
    }, delay);

    const revealTimeout = window.setTimeout(() => {
      setDisplayValue(value);
    }, delay + 250);

    const timeout = window.setTimeout(() => {
      setIsFlipping(false);
    }, delay + 610);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(revealTimeout);
      window.clearTimeout(timeout);
    };
  }, [delay, flipToken, previousValue, shouldFlip, value]);

  return (
    <span className={`price-flip-tile ${isFlipping ? 'is-flipping' : ''}`}>
      <span className="price-flip-static price-flip-static-top">
        <span>{isFlipping ? toValue : displayValue}</span>
      </span>
      <span className="price-flip-static price-flip-static-bottom">
        <span>{displayValue}</span>
      </span>
      {isFlipping ? (
        <span key={flipKey} className="price-flip-overlay" aria-hidden="true">
          <span className="price-flip-flap price-flip-flap-old">
            <span>{fromValue}</span>
          </span>
          <span className="price-flip-flap price-flip-flap-new">
            <span>{toValue}</span>
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default function HeroCalculator() {
  const [direction, setDirection] = useState<'from-airport' | 'to-airport'>('from-airport');
  const [district, setDistrict] = useState(districts[0]);
  const [vehicle, setVehicle] = useState(vehicles[0]);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const price = Number(getDistrictPrice(district.group, vehicle.priceType));
  const previousPriceRef = useRef(price);
  const [priceFlip, setPriceFlip] = useState({ token: 0, previousPrice: price });

  useEffect(() => {
    if (price === previousPriceRef.current) return;

    setPriceFlip((current) => ({
      token: current.token + 1,
      previousPrice: previousPriceRef.current,
    }));
    previousPriceRef.current = price;
  }, [price]);

  const currentPriceTiles = ['€', ...String(price).split('')];
  const previousPriceTiles = ['€', ...String(priceFlip.previousPrice).split('')];

  const bookingHref = useMemo(() => {
    const params = new URLSearchParams({
      direction,
      district: district.value,
      vehicle: vehicle.value,
    });
    return `/book?${params.toString()}`;
  }, [direction, district.value, vehicle.value]);

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-[22px] border border-[#26344a] bg-[#142039] px-5 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:px-7 lg:px-8 lg:py-8 min-[1536px]:max-w-[620px] min-[1900px]:max-w-[680px] min-[1900px]:rounded-[25px] min-[1900px]:px-10 min-[1900px]:py-10">
      <div className="flex items-center justify-between gap-6">
        <h2 className="font-display text-[clamp(1.45rem,1.6vw,1.75rem)] font-black tracking-[-0.03em] text-[#F4F1E8]">
          Fixpreis berechnen
        </h2>
        <span className="hidden font-mono text-[clamp(0.75rem,0.82vw,0.94rem)] uppercase tracking-[0.26em] text-[#93A0B5] sm:inline">
          In 10 Sekunden
        </span>
      </div>

      <div className="mt-6 grid rounded-[15px] border border-[rgba(244,241,232,0.08)] bg-[#0b1322] p-1 min-[1900px]:mt-8">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setDirection('from-airport')}
            className={`inline-flex h-[48px] items-center justify-center rounded-[12px] text-[clamp(0.9rem,0.95vw,1.1rem)] font-black sm:h-[52px] min-[1900px]:h-[58px] min-[1900px]:text-[20px] ${
              direction === 'from-airport' ? 'bg-[#F4F1E8] text-[#0b1322]' : 'text-[#93A0B5]'
            }`}
          >
            <Plane size={20} className="mr-2" />
            Vom Flughafen
          </button>
          <button
            type="button"
            onClick={() => setDirection('to-airport')}
            className={`inline-flex h-[48px] items-center justify-center rounded-[12px] text-[clamp(0.9rem,0.95vw,1.1rem)] font-black sm:h-[52px] min-[1900px]:h-[58px] min-[1900px]:text-[20px] ${
              direction === 'to-airport' ? 'bg-[#F4F1E8] text-[#0b1322]' : 'text-[#93A0B5]'
            }`}
          >
            Zum Flughafen
            <Plane size={20} className="ml-2" />
          </button>
        </div>
      </div>

      <div className="relative mt-6 min-[1900px]:mt-8">
        <p className="font-mono text-[clamp(0.78rem,0.82vw,0.94rem)] uppercase tracking-[0.28em] text-[#93A0B5]">Bezirk in Wien</p>
        <button
          type="button"
          onClick={() => setIsDistrictOpen((current) => !current)}
          aria-expanded={isDistrictOpen}
          aria-controls="hero-district-menu"
          className="mt-3 flex h-[54px] w-full items-center justify-between rounded-[15px] border border-[rgba(244,241,232,0.08)] bg-[#0b1322] px-5 text-left text-[clamp(0.98rem,1vw,1.16rem)] font-semibold text-[#F4F1E8] min-[1900px]:mt-4 min-[1900px]:h-[62px] min-[1900px]:text-[21px]"
        >
          <span className="truncate pr-4">{district.label}</span>
          <ChevronDown size={24} className={`text-[#93A0B5] transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDistrictOpen ? (
          <div
            id="hero-district-menu"
            role="listbox"
            className="servus-district-menu absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-[15px] border border-[rgba(244,241,232,0.10)] bg-[#0b1322] shadow-[0_22px_55px_rgba(0,0,0,0.45)]"
          >
            {districts.map((item) => (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={district.value === item.value}
                onClick={() => {
                  setDistrict(item);
                  setIsDistrictOpen(false);
                }}
                className={`flex min-h-[48px] w-full items-center justify-between gap-4 px-4 py-3 text-left text-[15px] font-semibold text-[#F4F1E8] transition-colors hover:bg-[#142039] sm:min-h-[52px] sm:px-5 sm:text-[17px] ${
                  district.value === item.value ? 'bg-[rgba(255,182,41,0.10)]' : ''
                }`}
              >
                <span className="min-w-0 truncate">{item.label}</span>
                {district.value === item.value ? <Check size={18} className="text-[#3ECF8E]" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 min-[1900px]:mt-8">
        <p className="font-mono text-[clamp(0.78rem,0.82vw,0.94rem)] uppercase tracking-[0.28em] text-[#93A0B5]">Fahrzeug</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {vehicles.map((option) => {
            const active = vehicle.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setVehicle(option)}
                className={`relative flex min-h-[92px] flex-col items-center justify-center rounded-[15px] border px-3 text-center min-[1900px]:min-h-[116px] min-[1900px]:px-4 ${
                  active ? 'border-[#FFB629] bg-[rgba(244,241,232,0.08)]' : 'border-[rgba(244,241,232,0.08)] bg-[#0b1322]'
                }`}
              >
                {option.badge ? (
                  <span className="absolute -top-[14px] rounded-full bg-[#FFB629] px-4 py-1 font-mono text-[12px] font-black uppercase tracking-[0.16em] text-[#070d18]">
                    {option.badge}
                  </span>
                ) : null}
                <span className={`font-display text-[clamp(1rem,1vw,1.16rem)] font-black min-[1900px]:text-[21px] ${active ? 'text-[#F4F1E8]' : 'text-[#93A0B5]'}`}>
                  {option.title}
                </span>
                <span className="mt-2 inline-flex items-center gap-3 text-[clamp(0.75rem,0.78vw,0.88rem)] font-semibold text-[#93A0B5] min-[1900px]:mt-3 min-[1900px]:gap-4 min-[1900px]:text-[15px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={15} fill="currentColor" strokeWidth={0} />
                    {option.people}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={15} />
                    {option.bags}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 rounded-[18px] bg-[#050b15] px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 min-[1900px]:mt-8 min-[1900px]:gap-6 min-[1900px]:rounded-[20px] min-[1900px]:px-8 min-[1900px]:py-8">
        <div>
          <p className="font-mono text-[clamp(0.75rem,0.82vw,0.94rem)] uppercase tracking-[0.28em] text-[#93A0B5]">Ihr garantierter Fixpreis</p>
          <div className="mt-5 flex gap-2" aria-label={`Fixpreis ${price} Euro`}>
            {currentPriceTiles.map((value, index) => (
              <PriceFlipTile
                key={index}
                value={value}
                previousValue={previousPriceTiles[index] ?? value}
                flipToken={priceFlip.token}
                delay={index === 0 ? 0 : (index - 1) * 95}
                shouldFlip={index > 0 && priceFlip.token > 0}
              />
            ))}
          </div>
        </div>
        <div className="font-mono text-[clamp(0.88rem,0.94vw,1.13rem)]">
          <p className="text-[#ff6666] line-through">Taxameter ~ €{price + 21}</p>
          <p className="mt-3 text-[#3ECF8E]">Sie sparen ca. €21</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 sm:gap-4 min-[1900px]:mt-7">
        <Link
          href={bookingHref}
          className="inline-flex h-[58px] flex-1 items-center justify-center rounded-[16px] bg-[#FFB629] px-5 text-center text-[clamp(1rem,1vw,1.16rem)] font-black text-[#070d18] shadow-[0_18px_55px_rgba(255,182,41,0.24)] transition-transform duration-200 hover:scale-[1.01] sm:h-[64px] min-[1900px]:h-[74px] min-[1900px]:rounded-[18px] min-[1900px]:px-6 min-[1900px]:text-[21px]"
        >
          Jetzt zum Fixpreis buchen
        </Link>
        <a
          href="https://wa.me/436600000000"
          aria-label="WhatsApp"
          className="grid h-[58px] w-[66px] shrink-0 place-items-center rounded-[16px] bg-[#22C55E] text-[#070d18] transition-transform duration-200 hover:scale-[1.03] sm:h-[64px] sm:w-[76px] min-[1900px]:h-[74px] min-[1900px]:w-[90px] min-[1900px]:rounded-[18px]"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </a>
      </div>

      <div className="mt-7 flex items-start gap-4 text-[clamp(0.98rem,1vw,1.13rem)] leading-[1.55] text-[#93A0B5]">
        <ShieldCheck size={21} className="mt-1 shrink-0" />
        <p>Keine Vorauszahlung. Preis gilt auch bei Stau, Umleitung &amp; Flugverspaetung.</p>
      </div>
    </div>
  );
}
