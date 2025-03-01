import Link from "next/link";
import {
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-16 md:flex items-center">
        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Marketing Copy for Real Estate Professionals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate high-quality property listings, social media posts, and
            email campaigns with minimal input. Save time and close more deals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="btn btn-primary flex items-center"
            >
              Get Started <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className="btn btn-outline">
              Learn More
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-gray-100 rounded-xl p-6 relative">
            <div className="aspect-video bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                {/* Placeholder until real image is available */}
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
                    <BuildingOffice2Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    RealtorCopyPal Dashboard
                  </h3>
                  <p className="text-sm text-gray-500">
                    Modern interface with dark sidebar and light content area
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Real Estate Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create compelling marketing content that
            sells properties faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Property Listing Generator"
            description="Create compelling property descriptions that highlight key features and appeal to your target buyers."
            icon={<BuildingOffice2Icon className="h-8 w-8" />}
            href="/property-listing"
            color="blue"
          />
          <FeatureCard
            title="Social Media Post Generator"
            description="Generate platform-specific posts with hashtags, emojis, and hooks that engage your audience."
            icon={<DocumentTextIcon className="h-8 w-8" />}
            href="/social-media"
            color="purple"
          />
          <FeatureCard
            title="Email Campaign Generator"
            description="Create personalized email campaigns with compelling subject lines and clear calls to action."
            icon={<EnvelopeIcon className="h-8 w-8" />}
            href="/email-campaign"
            color="green"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <div className="card">
          <div className="card-header">
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Choose Content Type
                </h3>
                <p className="text-gray-600">
                  Select the type of marketing content you need to create.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-lg font-medium mb-2">Fill Simple Form</h3>
                <p className="text-gray-600">
                  Provide a few key details about your property or campaign.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Get Multiple Variations
                </h3>
                <p className="text-gray-600">
                  Review, edit, and save your generated marketing copy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Starter"
            price="$29"
            description="Perfect for individual agents just getting started."
            features={[
              "50 AI generations per month",
              "Property listing generator",
              "Social media post generator",
              "Email templates",
              "Save up to 25 listings",
            ]}
            buttonText="Get Started"
            href="/dashboard"
            featured={false}
          />
          <PricingCard
            title="Professional"
            price="$79"
            description="Ideal for busy agents who need more content."
            features={[
              "200 AI generations per month",
              "All Starter features",
              "Advanced customization options",
              "Priority support",
              "Save unlimited listings",
            ]}
            buttonText="Get Started"
            href="/dashboard"
            featured={true}
          />
          <PricingCard
            title="Team"
            price="$199"
            description="For real estate teams and small brokerages."
            features={[
              "500 AI generations per month",
              "All Professional features",
              "5 team member accounts",
              "Team content library",
              "Brand voice customization",
            ]}
            buttonText="Contact Sales"
            href="/contact"
            featured={false}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="mb-16">
        <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
          <div className="md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-semibold mb-2 text-blue-800">
                Ready to elevate your real estate marketing?
              </h2>
              <p className="text-gray-600 mb-4">
                Sign in to save your generated content and access your
                dashboard.
              </p>
              <Link href="/dashboard" className="btn btn-primary">
                Sign In / Get Started
              </Link>
            </div>
            <div className="md:w-1/3">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <p className="italic text-gray-600 mb-2">
                  &ldquo;This tool has saved me hours of writing time and my
                  listings are getting more attention than ever!&rdquo;
                </p>
                <p className="font-medium">— Sarah Johnson, Realtor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "purple" | "green";
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
}: FeatureCardProps) {
  const colorClasses = {
    blue: "border-blue-600 text-blue-800",
    purple: "border-purple-600 text-purple-800",
    green: "border-green-600 text-green-800",
  };

  return (
    <Link href={href} className="block">
      <div
        className={`bg-white rounded-lg shadow-lg p-8 h-full hover:shadow-xl transition-shadow border-t-4 ${colorClasses[color]}`}
      >
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg bg-${color}-50 mr-4`}>{icon}</div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className={`text-${color}-600 font-medium flex items-center`}>
          Get started <ArrowRightIcon className="ml-2 h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  href: string;
  featured: boolean;
}

function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  href,
  featured,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${
        featured
          ? "ring-2 ring-blue-600 transform scale-105 md:-translate-y-2"
          : "border border-gray-200"
      }`}
    >
      {featured && (
        <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 ml-1">/month</span>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <Link
          href={href}
          className={`btn w-full ${
            featured ? "btn-primary" : "btn-outline"
          } mb-6`}
        >
          {buttonText}
        </Link>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
