import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="December 22, 2025">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Privacy Policy - Vanijay.com Nepal Online Shopping
Last Updated: December 22, 2025

At Vanijay.com, we value your privacy and are committed to protecting your personal information. As Nepal's trusted online shopping platform, we handle your data responsibly and in full compliance with Nepal's Privacy Act, 2075 (2018).

1. What Information We Collect: Name, email, phone number, address.
2. How We Use Your Information: Process orders, account management, support.
3. How We Share Your Information: Trusted service providers, delivery partners.
4. Cookies & Tracking: Manage in browser settings.
5. Your Privacy Rights: Access, update, marketing opt-out, deletion.
6. Data Security: Strong security measures including encryption.
7. How Long We Keep Your Data: As long as needed for legal or business purposes.
8. Children's Privacy: Not for children under 16.
9. Third-Party Links: External links not covered by this policy.
10. Changes to This Policy: Updated occasionally.
11. Contact Us: vanijayenterprises@gmail.com`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (गोपनीयता नीति)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`गोपनीयता नीति (Privacy Policy) - Vanijay.com नेपाल अनलाइन सपिङ
अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

Vanijay.com मा, हामी तपाईँको गोपनीयताको कदर गर्छौँ। हामी तपाईँको डाटालाई नेपालको वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५ अनुसार व्यवस्थापन गर्छौँ।

१. जानकारी संकलन: नाम, फोन, ठेगाना।
२. प्रयोग: डेलिभरी, खाता व्यवस्थापन।
३. साझेदारी: सेवा प्रदायक र डेलिभरी साझेदारसँग मात्र।
४. अधिकार: पहुँच र सच्याउने अनुरोध।

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
