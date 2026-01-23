import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function TermsConditionsPage() {
    return (
        <PolicyLayout title="Terms and Conditions" lastUpdated="January 23, 2026">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Terms and Conditions
Last Updated: 23-JAN-2026

1. Acceptance: By using Vanijay.com, you agree to all Policies.
2. Eligibility: 16+ or supervised.
3. Accounts: User responsibility for credentials.
4. Products: Info/Prices subject to change.
5. Payments: eSewa, Khalti, COD, cards.
6. User Conduct: No illegal activity.
7. Intellectual Property: Owned by Vanijay Enterprises.
8. Law: Governed by Laws of Nepal.

Contact: vanijayenterprises@gmail.com`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (नियम तथा शर्तहरू)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`नियम तथा शर्तहरू - Vanijay.com अनलाइन सपिङ प्लेटफर्म
अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

१. योग्यता: कम्तिमा १६ वर्षको हुनुपर्छ।
२. खाता: पासवर्ड गोप्य राख्नुहोस्।
३. भुक्तानी: अनलाइन वा COD मार्फत।
४. कानुन: नेपालको कानुन बमोजिम समाधान गरिनेछ।

सम्पर्क:
वाणिजय इन्टरप्राइजेज
इमेल: vanijayenterprises@gmail.com
फोन: ९७६१०१२८१३`}
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
