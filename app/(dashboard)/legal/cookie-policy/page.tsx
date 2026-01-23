import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function CookiePolicyPage() {
    return (
        <PolicyLayout title="Cookie Policy" lastUpdated="December 22, 2025">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Cookies Policy for VANIJAY.COM
Last Updated: December 22, 2025

1. Introduction
This Cookies Policy explains what cookies are, how we use them on the Vanijay.com website and the Platform.

2. What Are Cookies?
Small text files placed on your device to help websites work better.

3. How and Why We Use Cookies
- Strictly Necessary, Performance / Analytics, Functionality, Targeting / Advertising.

4. Contact Us
Vanijay Enterprises
Email: vanijayenterprises@gmail.com
Phone: +977 976101281`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (कुकिज नीति)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

Vanijay.com मा तपाईँलाई स्वागत छ! यो कुकिज नीतिले नेपालमा तपाईँको अनलाइन सपिङ अनुभवलाई अझ राम्रो बनाउन हामीले हाम्रो वेबसाइटमा कुकिज कसरी प्रयोग गर्छौँ भन्ने कुराको व्याख्या गर्छ।

कुकिज (Cookies) भनेको के हो?
साना टेक्स्ट फाइलहरू हुन् जसले वेबसाइटहरूलाई राम्रोसँग चल्न र सहज अनुभव प्रदान गर्न मद्दत गर्दछ।

सम्पर्क:
वाणिजय इन्टरप्राइजेज
ईमेल: vanijayenterprises@gmail.com
फोन: 9761012813`}
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
