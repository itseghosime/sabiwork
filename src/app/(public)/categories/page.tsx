import type { Metadata } from "next";
import Link from "next/link";
import { CategoryDirectory } from "@/features/search/category-directory";
import { DemoNotice } from "@/components/discovery";
import { Icon } from "@/components/icon";
export const metadata: Metadata = { title: "Explore services" };
export default function CategoriesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="next" size={14} />
            <span aria-current="page">Explore services</span>
          </nav>
          <p className="eyebrow">BENIN CITY ARTISAN DIRECTORY</p>
          <h1>
            Explore artisan trades
            <br />
            <span>in Benin City.</span>
          </h1>
          <p>
            Find the right technical specialty for your next project.
            <br />
            Browse skills, compare sample estimates and explore local profiles.
          </p>
        </div>
      </section>
      <section
        className="section container directory-section"
        aria-label="Service directory"
      >
        <CategoryDirectory />
        <div className="directory-help">
          <span className="category-icon">
            <Icon name="help" size={24} />
          </span>
          <div>
            <h2>Not sure which trade you need?</h2>
            <p>
              Search by the task itself. Try “leak repairs” or “door fittings”.
            </p>
          </div>
          <Link href="/artisans" className="button button-outline">
            Browse all artisans <Icon name="arrow" size={17} />
          </Link>
        </div>
        <DemoNotice />
      </section>
    </>
  );
}
