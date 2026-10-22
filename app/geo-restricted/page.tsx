import ErrorScreen from "@/components/ErrorScreen"

/** Shown when middleware redirects non-US visitors (except IN/PK/PH → /blog). */
export default function GeoRestrictedPage() {
  return <ErrorScreen />
}
