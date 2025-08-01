import { type LoaderFunctionArgs, redirect } from "@shopify/remix-oxygen";

// fallback wild card for all unauthenticated routes in account section
export async function loader({ context }: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return redirect("/account");
}
