import { lazy, Suspense, useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MapPinned,
  PackageSearch,
  Sprout,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import AsyncStatus from "../components/AsyncStatus";
import useApiCollection from "../hooks/useApiCollection";
import { api } from "../services/api";
import "./Home.css";

const MapPlaceholder = lazy(() => import("../components/MapPlaceholder"));
const KETU_MARKET_FALLBACK = {
  _id: "ketu-fruit-market-home",
  name: "Ketu Fruit Market",
  address: "463 Ikorodu Road, Ketu",
  location: { latitude: 6.5958, longitude: 3.3855 },
};

const valuePoints = [
  {
    icon: Sprout,
    title: "Farm-direct harvest",
    copy: "Clear origin details from the people who grow your food.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted listings",
    copy: "A considered marketplace built around verified producers.",
  },
  {
    icon: Truck,
    title: "Pickup that fits",
    copy: "Plan around market days and the collection point you choose.",
  },
];

export default function Home() {
  const {
    records: products,
    loading: productsLoading,
    error: productsError,
  } = useApiCollection(api.products.list);
  const { records: markets } = useApiCollection(api.markets.list);
  const ketuMarketRecord = markets.find(
    (market) => market.name?.trim().toLowerCase() === "ketu fruit market",
  );
  const ketuLatitude = ketuMarketRecord?.location?.latitude;
  const ketuLongitude = ketuMarketRecord?.location?.longitude;
  const ketuHasCoordinates =
    ketuLatitude !== null &&
    ketuLatitude !== undefined &&
    ketuLatitude !== "" &&
    ketuLongitude !== null &&
    ketuLongitude !== undefined &&
    ketuLongitude !== "" &&
    Number.isFinite(Number(ketuLatitude)) &&
    Number.isFinite(Number(ketuLongitude));
  const ketuMarket = ketuMarketRecord
    ? {
        ...KETU_MARKET_FALLBACK,
        ...ketuMarketRecord,
        address: ketuMarketRecord.address || KETU_MARKET_FALLBACK.address,
        location: ketuHasCoordinates
          ? ketuMarketRecord.location
          : KETU_MARKET_FALLBACK.location,
      }
    : KETU_MARKET_FALLBACK;
  useEffect(() => {
    document.title = "MarketLink | From farm to your market";
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div
          className="hero-photo"
          role="img"
          aria-label="Freshly harvested produce at a local market"
        />
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            A better way to source staples
          </span>
          <h1>
            Direct staple foodstuff, <em>from farm to your market.</em>
          </h1>
          <p>
            Meet the growers behind your weekly shop. Find nearby markets,
            explore current harvests, and plan a simple pickup.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/markets">
              Explore markets <ArrowRight size={17} />
            </Link>
            <Link className="hero-secondary" to="/register">
              Become a farmer partner <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-proof">
            <span className="proof-icon">
              <MapPinned size={18} />
            </span>
            <span>Local supply, made easier to find</span>
          </div>
        </div>
        <div className="hero-index">
          <span>01</span>
          <span className="index-line" />
          <span>MarketLink</span>
        </div>
      </section>

      <section className="home-section content-width harvest-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">At the market</span>
            <h2>Fresh from the network</h2>
            <p>
              Harvests and market listings will appear here as they become
              available.
            </p>
          </div>
          <Link className="text-link" to="/products">
            View all harvests <ArrowRight size={16} />
          </Link>
        </div>
        <AsyncStatus loading={productsLoading} error={productsError} />
        <div className="harvest-slots" aria-label="Featured harvests">
          {!productsLoading &&
            !productsError &&
            (products.length ? (
              products.slice(0, 3).map((product) => (
                <article className="home-product" key={product._id}>
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} />
                  )}
                  <div>
                    <span>{product.category}</span>
                    <strong>{product.name}</strong>
                    <small>
                      {product.price} / {product.unit}
                    </small>
                  </div>
                </article>
              ))
            ) : (
              <div className="harvest-slot">
                <PackageSearch size={23} />
                <span>No products listed yet</span>
              </div>
            ))}
        </div>
      </section>

      <section className="market-band">
        <div className="content-width market-band-inner">
          <div className="market-band-copy">
            <span className="eyebrow">Know your source</span>
            <h2>Good food has a place, a season, and a person behind it.</h2>
            <p>
              Browse local markets and meet producers on your own terms.
              MarketLink keeps the connection close and the details clear.
            </p>
            <Link className="button button-light" to="/markets">
              Find a market <ArrowRight size={17} />
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="market-empty" role="status">
                Loading Ketu market map…
              </div>
            }
          >
            <MapPlaceholder
              className="home-market-map"
              title="Ketu Fruit Market"
              detail="463 Ikorodu Road, Ketu"
              locations={[ketuMarket]}
              selectedLocationId={ketuMarket._id}
            />
          </Suspense>
          <span className="band-stamp">
            Grown
            <br />
            close
          </span>
        </div>
      </section>

      <section className="home-section content-width trust-section">
        <div className="trust-title">
          <span className="eyebrow">The MarketLink promise</span>
          <h2>From trusted hands, to your kitchen.</h2>
        </div>
        <div className="trust-points">
          {valuePoints.map(({ icon: Icon, title, copy }) => (
            <article className="trust-point" key={title}>
              <span className="trust-icon">
                <Icon size={21} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
