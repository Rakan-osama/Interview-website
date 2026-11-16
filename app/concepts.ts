import {domainConcepts} from './domain-concepts';
import {engineeringConcepts} from './engineering-concepts';
export type Concept = {id:string;title:string;group:string;intro:string;how:string;when:string;code:string;walkthrough:string[];trap:string;check:string;simple?:string;scenario?:string};
export const concepts:Concept[] = [
  {
    "id": "php-types",
    "title": "Dynamic typing وType declarations",
    "group": "PHP",
    "intro": "PHP dynamically typed: نوع قيمة المتغير بيتحدد وقت التنفيذ وممكن يتغير. ده مختلف عن Type declarations اللي بتحط عقد واضح على parameters وreturn values وproperties؛ التصريح بالنوع بيقلّل الحالات الغامضة، لكنه مش بيخلّي كل البرنامج statically typed.",
    "how": "في scalar parameters، coercive mode ممكن يحوّل قيمة مناسبة لنوع آخر. strict_types=1 في ملف الاستدعاء يمنع التحويلات دي في calls العادية، مع استثناء int المقبول لـfloat. أما validation فوظيفتها تتأكد إن القيمة مناسبة للـbusiness rule، زي quantity أكبر من صفر.",
    "when": "استخدم types واضحة عند حدود الـservices والـDTOs. اعمل validation قبل تحويل request input، لأن (int)\"abc\" بيطلع صفر بدل ما يشرح إن المدخل غلط.",
    "code": "declare(strict_types=1);\nfunction total(int $quantity, int $unitPrice): int {\n    if ($quantity < 1) throw new InvalidArgumentException();\n    return $quantity * $unitPrice;\n}\ntotal(2, 1500); // 3000 minor units\n// total(\"2\", 1500) throws TypeError from this caller.",
    "walkthrough": [
      "التوقيع بيقول إن الدالة محتاجة integers وبترجع integer. الشرط جوه الدالة بيحمي invariant مش موجودة في int type نفسها.",
      "strict_types مش بيحل overflow ولا صحة العملة، ومش بيغيّر مصدر request string تلقائيًا لقيمة موثوقة."
    ],
    "trap": "وجود type int مش دليل إن quantity موجبة، ولا إن كل call من ملف تاني هيستخدم نفس coercion policy.",
    "check": "إيه الفرق بين خطأ في type وخطأ في business value؟ ادّي مثال quantity=-2."
  },
  {
    "id": "arrays-values",
    "title": "Arrays، References وValue semantics",
    "group": "PHP",
    "intro": "PHP array عبارة عن ordered map، مش list فقط. ممكن تشيل integer وstring keys، وبعض المفاتيح بتتعملها coercion؛ مثل \"1\" و1 ممكن يشاوروا على نفس entry. لازم تحدد هل البيانات عندك list ولا map، وهل ترتيبها جزء من الـcontract.",
    "how": "Array assignment له value semantics مع copy-on-write. أما object assignment فبينقل object identifier لنفس الـobject. الـreference باستخدام & مفهوم مختلف، وممكن يفضل مربوط بآخر عنصر بعد foreach لو متفصلش.",
    "when": "اختار map للـlookups وdense list للتعامل بالـindices. حافظ على IDs الخارجية كقيم أو prefix keys لما identity الدقيقة مهمة، واستخدم transformation واضحة بدل references لو مش محتاج mutation.",
    "code": "$original = [10, 20];\n$copy = $original;\n$copy[0] = 99; // $original is still [10, 20]\nforeach ($original as &$item) { $item *= 2; }\nunset($item); // detach the last-element reference\n$lookup = ['id:01' => true, 'id:1' => true];",
    "walkthrough": [
      "تعديل $copy مش بيعدّل $original؛ copy-on-write optimization مش تغيير لمعنى value semantics.",
      "unset هنا بيفصل alias بتاع loop variable، ومش بيمسح آخر عنصر من الـarray."
    ],
    "trap": "إعادة استخدام foreach variable بعد reference loop ممكن تكتب فوق آخر عنصر من غير قصد.",
    "check": "ليه clone للـobject مش بالضرورة يفصل nested objects؟"
  },
  {
    "id": "closures",
    "title": "Closures، Capture وHigher-order functions",
    "group": "PHP",
    "intro": "Closure هي function ممكن تتخزن في variable وتتبعث كـargument. فائدتها إنك تمرّر behavior بدل تكرار loop logic، زي predicate للتصفية أو pricing calculation. الـcapture بيحدد إيه من outer scope يفضل متاح للـfunction.",
    "how": "use ($x) بياخد قيمة وقت إنشاء closure، وuse (&$x) بيحتفظ بـreference. Arrow function بتعمل implicit capture by value. لو القيمة object، نسخ identifier مش معناه نسخ حالة الـobject، فـside effects لسه ممكنة.",
    "when": "استخدم closures قصيرة وواضحة في transformations. لما الحساب يبقى له dependencies أو rules كتير، class باسم واضح وconstructor injection غالبًا أسهل في الاختبار من closure ضخمة.",
    "code": "$rate = 10;\n$tax = fn(int $amount): int => intdiv($amount * $rate, 100);\n$rate = 20;\necho $tax(1000); // 100: captured rate was 10\n$positive = array_values(array_filter([0, 2, -1], fn($n) => $n > 0));",
    "walkthrough": [
      "Arrow function احتفظت بقيمة rate وقت تعريفها، فالتعديل اللاحق مش بيغيّر النتيجة هنا.",
      "array_filter بيحافظ على keys؛ array_values بيرجع dense list لما ده هو output contract."
    ],
    "trap": "الـcallback اللي بيعمل network call لكل item ممكن يخبّي I/O مكلف جوه كود شكله transformation بسيطة.",
    "check": "إمتى capture by reference يبقى مقصود، وإمتى يبقى سبب bugs؟"
  },
  {
    "id": "generators",
    "title": "Generators وLazy processing",
    "group": "PHP",
    "intro": "Generator بيطلع values واحدة واحدة باستخدام yield بدل ما يبني collection كاملة قبل الاستهلاك. التنفيذ بيقف عند yield ويرجع يكمل لما المستهلك يطلب العنصر التالي، فممكن تحافظ على memory bounded حتى مع input كبير.",
    "how": "المكسب لازم يبدأ من مصدر القراءة نفسه: fopen وfgetcsv بيقروا تدريجيًا. لو استخدمت file() لتحميل الملف كله وبعدين yield، الذاكرة اتحجزت بالفعل. كمان downstream consumer لو جمع كل values في array هيفقد ميزة streaming.",
    "when": "مناسب لاستيراد CSV أو معالجة سجلات كبيرة في batches. مش مناسب لو محتاج random access متكرر لكل العناصر من غير تكلفة materialization مقصودة.",
    "code": "function rows(string $path): Generator {\n    $handle = fopen($path, 'r');\n    if ($handle === false) throw new RuntimeException('Cannot open CSV');\n    try {\n        while (($row = fgetcsv($handle)) !== false) yield $row;\n    } finally { fclose($handle); }\n}\nforeach (rows($path) as $row) { /* validate and process one row */ }",
    "walkthrough": [
      "المصدر بيقرأ row واحدة، والمستهلك مسؤول إنه ما يحتفظش بكل rows بعد معالجتها.",
      "finally بيقفل resource في المسار الطبيعي وخلال exception unwinding؛ process kill محتاج cleanup strategy أوسع."
    ],
    "trap": "iterable مش وعد إنك تقدر تعدّ العناصر أو تعيد iteration أكتر من مرة.",
    "check": "إزاي تقيس peak memory وتتأكد إن المستهلك مش بيحتفظ بكل النتائج؟"
  },
  {
    "id": "enums",
    "title": "Enums، match وState transitions",
    "group": "PHP",
    "intro": "Enum بيحصر قيم domain مسموحة، زي حالات الـorder. ده يقلّل magic strings وtypos، ويخلّي signatures أوضح. Backed enum له scalar value للتخزين أو النقل، لكن enum لوحده مش بيحدد الانتقالات القانونية بين الحالات.",
    "how": "tryFrom بيحوّل external scalar لقيمة enum أو null لو غير مدعومة. match بيقارن strict ويرجع expression من غير fall-through. لازم تحدد كل الحالات اللي التنفيذ ممكن يوصل لها أو تتعامل مع UnhandledMatchError.",
    "when": "استخدم enum لما القيم فعلًا مجموعة معروفة في code. لو الحالات user-configurable ومتغيرة من DB، جدول وقواعد domain ممكن يكونوا أنسب.",
    "code": "enum PaymentStatus: string {\n    case Pending = 'pending';\n    case Paid = 'paid';\n}\n$status = PaymentStatus::tryFrom($input);\nif ($status === null) throw new InvalidArgumentException('Unknown status');\n$label = match ($status) {\n    PaymentStatus::Pending => 'Awaiting payment',\n    PaymentStatus::Paid => 'Confirmed',\n};",
    "walkthrough": [
      "الـparsing بيمنع value غير معروفة من دخول بقية الـflow، وmatch بيعبّر صراحة عن كل حالة.",
      "منع Paid من الرجوع لـPending محتاج transition rule مستقلة وatomic update وقت concurrency."
    ],
    "trap": "وجود enum مش بديل عن policy ولا عن state machine بتحمي transitions.",
    "check": "إيه اللي لازم تراجعه لما تضيف enum case جديدة؟"
  },
  {
    "id": "errors",
    "title": "Exceptions، Error boundaries وCleanup",
    "group": "PHP",
    "intro": "Exception بتعبّر عن فشل غير عادي بالنسبة للعملية الحالية. المطلوب مش إنك تمسك كل exception في كل layer، لكن تمسكها عند boundary تقدر تحوّل الفشل هناك لمعنى مفيد: provider timeout، invalid response، أو HTTP error مناسب.",
    "how": "خلي domain errors واضحة، وسيب unexpected failures للـglobal handler عشان تتسجل وتتراقب. استخدم finally للـcleanup، وسجّل correlation ID وcontext من غير credentials. Retry قرار مبني على نوع الفشل واحتمال تكرار الأثر.",
    "when": "مناسب في integration adapters وapplication boundaries. متستخدمش catch عام يرجع success عشان يخفي الخطأ، ومتستخدمش exceptions كبديل وحيد لكل validation result متوقعة.",
    "code": "try {\n    $result = $gateway->charge($request);\n} catch (ProviderTimeout $error) {\n    // Outcome is unknown: reconcile with the same idempotency key.\n    throw new PaymentPending(previous: $error);\n} finally {\n    // Release local resources; do not return from finally.\n}",
    "walkthrough": [
      "Timeout مش proof إن الـprovider منفّذش العملية، عشان كده النتيجة Pending لحين reconciliation.",
      "return من finally ممكن يطغى على return أو exception موجودة؛ خليها cleanup من غير إخفاء failure."
    ],
    "trap": "الـcatch اللي بيسجّل raw payload ممكن يسرّب secrets حتى لو الـresponse للمستخدم آمن.",
    "check": "لو العملية فشلت بعد external side effect، هل retry آمن؟"
  },
  {
    "id": "immutability",
    "title": "Immutability، Value Objects وMoney",
    "group": "PHP",
    "intro": "Immutable value مش بيتغير بعد إنشائه؛ أي transformation بترجع value جديدة. Value Object بيتعرف بقيمه ومعناه، زي Money(amount,currency)، وبيحمي invariants في constructor بدل ما يسمح بحالة ناقصة تتصلّح لاحقًا.",
    "how": "readonly بيمنع إعادة تعيين property بعد initialization في الحالات المدعومة، لكنه مش deep immutability للـobject اللي property بتشير له. اختار nested values آمنة، ووضّح rounding وtimezone أو currency كجزء من المعنى.",
    "when": "مناسب للـprices والـdate ranges والـIDs اللي ليها rules. استخدم minor units أو exact decimal حسب المجال، ومتتعاملش مع float كحساب مالي دقيق تلقائيًا.",
    "code": "final readonly class Money {\n    public function __construct(public int $minor, public string $currency) {}\n    public function add(self $other): self {\n        if ($other->currency !== $this->currency) throw new DomainException();\n        return new self($this->minor + $other->minor, $this->currency);\n    }\n} // Simplified: production code also validates currency/overflow.",
    "walkthrough": [
      "add بترجع object جديد، والـvalues القديمة بتفضل زي ما هي، فمشاركة المرجع بتبقى أقل مفاجآت.",
      "مقارنة currency بتحمي rule مهمة؛ scale وrounding وoverflow لسه محتاجين تصميم واختبارات."
    ],
    "trap": "كل العملات مش خانتين عشريتين، وreadonly مش ضمان إن nested mutable state مش هيتغيّر.",
    "check": "إيه invariants اللي هتضيفها لـDateRange أو Money قبل استخدامها في billing؟"
  },
  {
    "id": "unicode",
    "title": "Strings، Unicode وEncoding boundaries",
    "group": "PHP",
    "intro": "PHP string بتخزّن bytes. كلمة عربية ممكن يكون كل حرف فيها أكتر من byte في UTF-8، وبعض الرموز اللي المستخدم شايفها حرف واحد بتتكون من code points متعددة. عشان كده لازم تحدد المقصود بكلمة length أو index.",
    "how": "strlen وsubstr byte-oriented. mb_* بتساعد في multibyte code points، وgrapheme_* من intl بتناسب user-perceived characters لما المتطلبات محتاجاها. خلّي encoding واضحة في HTTP وDB والـfiles.",
    "when": "مهم في تقصير names ورسائل SMS والـsearch. بعض algorithms التعليمية بتفترض ASCII؛ متعممش نتائجها على عربي أو emoji من غير تغيير contract والمعالجة.",
    "code": "$name = 'أحمد';\n$bytes = strlen($name);\n$codePoints = mb_strlen($name, 'UTF-8');\n$preview = mb_substr($name, 0, 3, 'UTF-8');\n// For grapheme clusters, use grapheme_* with the intl extension.",
    "walkthrough": [
      "الـbyte count مش مساوي لعدد حروف الاسم؛ تقطيع نص في نص multibyte sequence ممكن يبوّظ الـencoding.",
      "اختبر combining marks وemoji sequences، ومتكتفيش بEnglish fixtures."
    ],
    "trap": "الـnormalization أو case folding قرار له تأثير على search والـIDs؛ مش transformation عمياء لكل البيانات.",
    "check": "لو الحد 20 حرف في واجهة المستخدم، هل تقيس bytes ولا code points ولا graphemes؟"
  },
  {
    "id": "composer",
    "title": "Composer، PSR-4 وDependency reproducibility",
    "group": "PHP",
    "intro": "Composer بيحل dependencies وبيجهّز autoloading. composer.json بيوصف constraints، وcomposer.lock بيسجّل graph محددة من versions. للـapplication، الـlock جزء مهم من reproducible build بدل مفاجآت أثناء deploy.",
    "how": "composer install بيستعمل graph الموجودة في lock، بينما update بيعيد resolution ويحدّثه. PSR-4 بيربط namespace prefix بمجلد؛ exact filename case مهمة على Linux حتى لو mismatch استخبى على Windows.",
    "when": "اعمل updates في branch مع review وCI وplatform checks، وانشر locked dependencies. راجع maintenance وsecurity وlicense قبل إضافة package عشان ميكونش الحل أغلى من المشكلة.",
    "code": "// composer.json, simplified PSR-4 mapping:\n{\"autoload\":{\"psr-4\":{\"App\\\\\":\"app/\"}}}\n// App\\Services\\Checkout => app/Services/Checkout.php\n// Build/release workflow:\n// composer install --no-dev --prefer-dist --optimize-autoloader\n// Run updates deliberately in development, then test and commit the lock.",
    "walkthrough": [
      "autoload mapping مش بيمسح مشكلة namespace غلط؛ لازم class/file/path يكونوا متوافقين.",
      "الـproduction flags تقلل development dependencies، لكن platform extensions ونسخة PHP لازم تتراجع برضه."
    ],
    "trap": "composer update على production خطوة غير مراجعة ممكن تغيّر dependencies وقت release.",
    "check": "ليه class تشتغل على Windows وتفشل على Linux رغم وجود الملف؟"
  },
  {
    "id": "abstraction",
    "title": "Abstraction — التجريد كمفهوم",
    "group": "OOP",
    "intro": "Abstraction معناها تعرض للـclient السلوك الأساسي اللي محتاجه، وتخفي عنه التفاصيل اللي مش لازم يعرفها. في checkout، المستهلك محتاج يطلب payment ويعرف نتيجتها؛ مش لازم يعرف headers وvendor URLs وطريقة توقيع الطلب.",
    "how": "ابدأ بالـbehavior اللي المستهلك محتاجه، وبعدها صمّم boundary ثابتة بمعاني واضحة للـinputs والـresults والـerrors. Interface أو abstract class أو public class API ممكن يكونوا أدوات لتحقيق ده؛ المفهوم نفسه أوسع من أي keyword.",
    "when": "مفيد لما عندك تفاصيل متغيرة أو معقدة عايز تعزلها. abstraction ضعيفة لو بتسرّب vendor-specific values لكل المستهلكين، أو لو اتعملت قبل ما تفهم variation الحقيقي.",
    "code": "// Checkout talks in application concepts:\n$result = $payments->charge($paymentRequest);\nif ($result->isPending()) {\n    // Schedule reconciliation, independent of provider HTTP details.\n}",
    "walkthrough": [
      "الـclient بيتعامل مع معنى charge وpending، مش raw HTTP status بيختلف من provider للتاني.",
      "تحديد معنى النتيجة مهم زي إخفاء implementation؛ bool غامضة ممكن تخبّي authorized/captured/settled."
    ],
    "trap": "Abstraction وInterface مش مترادفين: الأولى مفهوم تصميم، والتانية construct بتعبّر عن contract.",
    "check": "إزاي abstraction تفضل مفيدة حتى لو عندك implementation واحدة دلوقتي؟"
  },
  {
    "id": "interfaces",
    "title": "Interfaces — Contracts قابلة للاستبدال",
    "group": "OOP",
    "intro": "Interface بتحدد contract public للمستهلك: العمليات المتاحة وtypes المطلوبة والمرجعة. Class بتعمل implements لازم تحقق العقد، لكن compiler مش بيثبت كل semantics زي إن charge فعلًا idempotent أو إن error classification صحيحة.",
    "how": "المستهلك يعتمد على contract، والتنفيذ يتوصل له عبر DI. أكتر من class يحقق نفس contract، وclass تقدر implement interfaces متعددة طالما signatures متوافقة. Parameter types والتوافق السلوكي مهمين للاستبدال.",
    "when": "استخدمها عند boundary ليها implementations أو test doubles مفيدة، زي payment أو clock أو SMS. متعملش interface لكل class تلقائيًا من غير حاجة فعلية.",
    "code": "interface PaymentGateway {\n    public function charge(PaymentRequest $request): PaymentResult;\n}\nfinal class CheckoutService {\n    public function __construct(private PaymentGateway $gateway) {}\n    public function pay(PaymentRequest $request): PaymentResult {\n        return $this->gateway->charge($request);\n    }\n}",
    "walkthrough": [
      "CheckoutService مش محتاج new StripeGateway؛ الاعتماد اتحدد في constructor فممكن تمرير fake في الاختبار.",
      "لازم توثّق معنى PaymentResult وحالات الفشل، وتعمل contract tests على implementations."
    ],
    "trap": "نفس signature مش proof إن implementations بتحافظ على نفس behavior أو failure guarantees.",
    "check": "ليه narrowing لparameter من float لـint ممكن يكسر interface compatibility؟"
  },
  {
    "id": "abstract-class",
    "title": "Abstract Classes — تنفيذ مشترك وحدود الوراثة",
    "group": "OOP",
    "intro": "Abstract class ماينفعش تنشئ منها object مباشرة، لكنها تقدر تجمع shared implementation وstate مع abstract hooks لازم subclasses تنفذها. دي أداة مختلفة عن interface اللي دورها الأساسي contract للمستهلك.",
    "how": "في Template Method، الأب يحدد flow ثابت ويترك خطوة محددة للتخصيص. PHP class ليها parent class واحدة، فاختيار inheritance بيستهلك علاقة قوية. لو الخطوات بتتغير مستقل، composition غالبًا أكثر مرونة.",
    "when": "استخدمها لما فيه is-a حقيقية وworkflow مشترك مستقر. متستخدمهاش لمجرد إن سطرين متكررين؛ التكرار وحده مش دليل إن lifecycle والـinvariants مشتركة.",
    "code": "abstract class Exporter {\n    final public function export(array $rows): string {\n        $this->validateRows($rows);\n        return $this->format($rows);\n    }\n    protected function validateRows(array $rows): void { /* shared rule */ }\n    abstract protected function format(array $rows): string;\n}",
    "walkthrough": [
      "final بتحمي ترتيب validate ثم format لو الترتيب invariant في التصميم.",
      "الـhook ضيقة وواضحة؛ لو كل خطوة بقت optional override، الـhierarchy غالبًا محتاجة إعادة نظر."
    ],
    "trap": "Abstract class مش multiple inheritance، وinheritance لازم تحافظ على قابلية الاستبدال بالسلوك.",
    "check": "في retry policy بتتغير مستقل عن gateway، ليه composition ممكن تبقى أنسب من base gateway؟"
  },
  {
    "id": "encapsulation",
    "title": "Encapsulation وDomain invariants",
    "group": "OOP",
    "intro": "Encapsulation مش مجرد private properties مع getters/setters. الهدف إنك تمنع object من الوصول لحالة غير صحيحة، وتخلي التغيير يحصل من operations بتعبّر عن الـdomain، زي cancel أو capture بدل setStatus لأي string.",
    "how": "حدد invariants في construction وكل transition. قلل أماكن mutation، وخلي persistence تحمي القواعد اللي لازم تصمد تحت concurrency. الـobject ممكن يكون صحيح في الذاكرة، لكن read/write race لسه محتاجة transaction strategy.",
    "when": "مفيد في orders وbilling والمخزون؛ كود CRUD البسيط ممكن يحتاج تصميم أخف. المهم يكون واضح مين مسؤول عن القاعدة ومين مسموح له يغيّر الحالة.",
    "code": "final class Order {\n    private string $status = 'pending';\n    public function cancel(): void {\n        if ($this->status !== 'pending') throw new DomainException();\n        $this->status = 'cancelled';\n    }\n    public function status(): string { return $this->status; }\n}",
    "walkthrough": [
      "الـcaller يقدر يطلب cancellation، لكنه ميقدرش يختار أي status ويتخطى transition rule.",
      "في DB، لازم تتحقق من الحالة الحالية atomically؛ object قديم ممكن يبقى stale وقت الحفظ."
    ],
    "trap": "الـsetter اللي بيقبل أي قيمة من غير rule مش حماية حقيقية حتى لو property private.",
    "check": "إيه invariants لازم تفضل صحيحة لو الـaction اتندهت من HTTP أو job أو CLI؟"
  },
  {
    "id": "solid",
    "title": "SOLID — خمس زوايا لتحسين التصميم",
    "group": "OOP",
    "intro": "SRP بيقلّل أسباب التغيير المتداخلة، OCP بيخلّي variation تتضاف عبر extension point مناسبة، LSP يحافظ على behavioral contract، ISP يضيّق contract حسب الـclient، وDIP يخلّي high-level rules تعتمد على abstractions بدل تفاصيل المورد.",
    "how": "طبّق المبادئ على مشكلة ملموسة: Controller عملاق يتقسم حسب reasons to change؛ gateway يتبدّل من غير تعديل checkout؛ read-only client مايتفرضش عليه save. DI طريقة تمرير dependency، أما DIP فقرار اتجاه الاعتماد.",
    "when": "استخدمها كعدسات للمراجعة، مش checklist تخلق layers وinterfaces لكل سطر. لازم توازن مرونة التصميم مع تكلفة الفهم والتعديل والاختبار.",
    "code": "// ISP: reporting only needs reads.\ninterface InvoiceReader { public function find(string $id): InvoiceView; }\ninterface InvoiceWriter { public function save(Invoice $invoice): void; }\nfinal class ReportService {\n    public function __construct(private InvoiceReader $invoices) {}\n}",
    "walkthrough": [
      "ReportService مرتبط بدور القراءة فقط، فimplementation read-only مش مضطرة تعمل save بترمي exception.",
      "ده مثال ISP وبيساعد LSP؛ فصل contracts لازم يعكس احتياج حقيقي للمستهلكين."
    ],
    "trap": "زيادة عدد classes مش مقياس لتطبيق SOLID، ونقل Controller عملاق لـService عملاق مش SRP.",
    "check": "إزاي تشرح الفرق بين Dependency Injection وDependency Inversion بمثال واحد؟"
  },
  {
    "id": "polymorphism",
    "title": "Polymorphism، Composition وBehavioral contracts",
    "group": "OOP",
    "intro": "Polymorphism بيخلّي نفس النداء على contract يروح لتنفيذ مختلف حسب object الفعلي. المستهلك ما يحتاجش يفحص instanceof لكل provider؛ دوره يعتمد على behavior متوافق وله نفس المعنى.",
    "how": "Composition بتركّب object من collaborators بدل inheritance لكل combination. مثل Gateway مع RetryPolicy وClock، بدل subclasses لكل provider×retry strategy. خليك صريح في ownership والـlifetime عشان mutable state ما تتشاركش غلط.",
    "when": "استخدم composition لما behaviors بتتغير مستقل. استخدم inheritance لما is-a والسلوك وقواعد construction فعلًا متوافقين؛ مش لمجرد مشاركة method اسمها واحد.",
    "code": "final class Checkout {\n    public function __construct(private PaymentGateway $payments) {}\n    public function run(PaymentRequest $request): PaymentResult {\n        return $this->payments->charge($request);\n    }\n}\n// Both FakeGateway and VendorGateway satisfy the same contract.",
    "walkthrough": [
      "Checkout بينادي نفس method من غير branching حسب provider، فاختبار fake بيحافظ على نفس boundary.",
      "لو implementation بتقبل parameter أقل أو تفسر النتيجة بشكل مختلف، substitution ممكن تتكسر رغم تشابه syntax."
    ],
    "trap": "Inheritance hierarchy كبيرة للـfeature combinations غالبًا علامة variation كان ممكن يتركّب بـcomposition.",
    "check": "إيه الضمانات السلوكية اللي هتختبرها لكل implementation لنفس contract؟"
  },
  {
    "id": "lifecycle",
    "title": "Laravel Request Lifecycle وMiddleware pipeline",
    "group": "Laravel",
    "intro": "الـrequest بتبدأ من public/index.php، وتحميل autoloader وapplication bootstrap، وبعدها framework initialization وproviders والـHTTP pipeline. Router بيحدد route والـContainer يساعد في resolve dependencies، ثم response يرجع عبر middleware.",
    "how": "Provider register مكان bindings، وboot للتهيئة بعد التسجيل. Middleware ممكن يبني context أو يرفض request أو يغيّر response بعد $next. ترتيب auth والـtenant resolution والـbindings مؤثر في correctness، مش مجرد تنظيم.",
    "when": "الفهم ده بيساعدك تحدد مكان validation وauth وlogging والـdependency binding، وتحقق سبب middleware متشغلتش أو binding مش موجودة. تفاصيل ملفات configuration تختلف بين versions؛ راجع version المشروع.",
    "code": "public function handle(Request $request, Closure $next): Response {\n    $requestId = (string) Str::uuid();\n    $request->attributes->set('request_id', $requestId);\n    $response = $next($request); // downstream route/controller\n    $response->headers->set('X-Request-ID', $requestId);\n    return $response;\n}",
    "walkthrough": [
      "قبل $next بتجهّز request context؛ بعده تقدر تضيف header للـresponse.",
      "Middleware مش المكان المناسب لعمل business transaction كاملة لمجرد إن كل requests بتعدي عليها."
    ],
    "trap": "Authentication middleware مش authorization لكل resource، والـprovider bootstrap مش مكان تنفيذ checkout.",
    "check": "لو tenant scope محتاج user authenticated، أي middleware لازم يسبق التاني؟"
  },
  {
    "id": "container",
    "title": "Service Container، DI وObject lifetimes",
    "group": "Laravel",
    "intro": "الـContainer مسؤول عن تركيب object graph: يعرف يبني class ويمرر dependencies المطلوبة. Concrete classes بسيطة ممكن تتحل بـreflection، لكن interface محتاجة binding يحدد التنفيذ. Constructor injection بتخلي الاعتماد ظاهر بدل service location مخفي.",
    "how": "bind مناسب لـresolution متجدد؛ singleton بيشارك instance حسب lifecycle التطبيق؛ scoped مناسب لسياق request/job في البيئات المدعومة. Long-lived workers بتخلي اختيار الـlifetime مهم، لأن user أو tenant state ممكن تفضل بين عمليات.",
    "when": "استعمل constructor injection في application/domain services، وسجّل vendor selection في provider أو factory. متخزّنش request object أو current user في process-wide singleton.",
    "code": "// In a service provider:\n$this->app->bind(PaymentGateway::class, VendorGateway::class);\n$this->app->scoped(TenantContext::class, fn() => new TenantContext());\n// Consumer:\npublic function __construct(private PaymentGateway $gateway) {}",
    "walkthrough": [
      "Binding بتفصل اختيار vendor عن business code، وممكن تتبدّل في test بـfake.",
      "Scoped lifetime مش authorization لوحدها؛ لازم TenantContext نفسها تتبني من مصدر موثوق وتتصفر حسب lifecycle."
    ],
    "trap": "استدعاء app() في كل method ممكن يخفي dependencies ويصعّب اختبار service خارج framework.",
    "check": "ليه singleton بريئة في PHP-FPM ممكن تسبب data leakage في long-lived worker؟"
  },
  {
    "id": "validation",
    "title": "Validation، Normalization وTrust boundaries",
    "group": "Laravel",
    "intro": "Validation بتجاوب: هل input شكلها وقيمها مسموحين؟ Normalization بتحوّل تمثيل مسموح لتمثيل ثابت، زي trim لاسم. Authorization بتجاوب سؤال مختلف: هل الشخص ده مسموح له يعمل العملية على الـresource دي؟ نجاح واحدة مش بديل عن الباقي.",
    "how": "FormRequest بتنظم rules وrequest-level authorization. استخدم validated data أو DTO mapping صريح، وسيب business invariants المهمة محمية داخل الـaction كمان. Database constraints بتسد window السباق بين validation والـwrite.",
    "when": "استخدمها عند HTTP boundaries، وحدد الفرق بين missing وnull وempty string، وحدود arrays وحجم payload. IDs في exists rule لسه محتاجة tenant/visibility checks.",
    "code": "public function rules(): array {\n    return [\n        'items' => ['required', 'array', 'min:1', 'max:100'],\n        'items.*.product_id' => ['required', 'integer'],\n        'items.*.quantity' => ['required', 'integer', 'min:1'],\n    ];\n}\n// Map only accepted fields; calculate authoritative prices server-side.",
    "walkthrough": [
      "Rules بتمنع quantity غير صالحة وتحدّ query/work cost، لكنها لسه مش بتثبت إن المنتج ينتمي للـtenant.",
      "الـaction تقرأ السعر والمخزون الموثوقين، وتعمل التعديل atomically وقت التنفيذ."
    ],
    "trap": "casting input لـint قبل validation ممكن يحوّل malformed input لقيمة ظاهرها valid.",
    "check": "ليه Rule::unique لوحدها مش كفاية لمنع duplicate records مع طلبين متزامنين؟"
  },
  {
    "id": "relationships",
    "title": "Eloquent Relationships وCardinality",
    "group": "Laravel",
    "intro": "Relationship بتعبّر عن ارتباط بيانات: belongsTo على child اللي بيحمل foreign key غالبًا، hasMany على الأب، belongsToMany بعلاقة join table، وmorphTo لعلاقة target متعددة الأنواع. اختار relation من cardinality الفعلية، مش اسم الـmodel.",
    "how": "Eloquent بيسهّل navigation وqueries، لكن DB constraints هي اللي بتحمي referential integrity وuniqueness. hasOne مثلًا مش unique constraint. Lazy access ممكن يعمل query، وwith بيجهّز العلاقات المطلوبة مسبقًا لتجنب N+1.",
    "when": "مناسب لإدارة associations واسترجاع related data. لو عندك reporting معقد، query واضح أو aggregate subquery ممكن يكون أنسب من تحميل object graph ضخم.",
    "code": "// Order model:\npublic function customer(): BelongsTo {\n    return $this->belongsTo(Customer::class);\n}\n$orders = Order::query()\n    ->with('customer:id,name')\n    ->select(['id', 'customer_id', 'total'])\n    ->paginate(25);",
    "walkthrough": [
      "customer_id لازم موجودة في selected order fields عشان ORM يربط النتائج؛ with يقلل per-row relationship lookups.",
      "paginate بتحدّ حجم response؛ eager loading لكل records مرة واحدة ممكن ينقل العيب للـmemory."
    ],
    "trap": "وجود relation method مش authorization، وpolymorphic relations ليها tradeoff في direct FK enforcement.",
    "check": "إمتى assignment pivot يبقى entity مستقلة بدل مجرد metadata على join table؟"
  },
  {
    "id": "scopes-casts",
    "title": "Query Scopes، Casts وModel boundaries",
    "group": "Laravel",
    "intro": "Scope بتجمع query condition قابلة لإعادة الاستخدام، وCast بتحوّل بين تمثيل storage وتمثيل PHP. الاتنين أدوات ORM، لكنهم مش بديل عن تعريف domain rules أو resource-level authorization.",
    "how": "Local scope تُستدعى صراحة، وglobal scope بتتطبق على Eloquent queries الخاصة بالـmodel إلا لو اتخطت. Raw SQL أو DB::table ممكن متعديش عليها. Casts زي enum أو encrypted بتغيّر القراءة والكتابة، وده له أثر على querying وحجم العمود.",
    "when": "استخدم scopes لفلترة واضحة، مع explicit tenant context في jobs. استخدم casts لما transformation مستقرة؛ لو encryption هتمنع search المطلوب، راجع design قبل التغيير.",
    "code": "public function scopeForTenant(Builder $query, int $tenantId): Builder {\n    return $query->where('tenant_id', $tenantId);\n}\nprotected function casts(): array {\n    return ['status' => OrderStatus::class, 'paid_at' => 'immutable_datetime'];\n}\n// Job/action receives a trusted tenant ID explicitly.",
    "walkthrough": [
      "Scope مش بتستنتج tenant من hidden global state، فالمستهلك يقدر يوضح مصدر السياق.",
      "Enum cast بيظبط representation، لكن allowed transitions لسه business rule مستقلة."
    ],
    "trap": "Bulk updates مش بتعمل hydrate لكل model، فمتفترضش observers هتشتغل لكل row.",
    "check": "إيه الـwrite/read paths اللي ممكن تتخطى global scopes أو model events؟"
  },
  {
    "id": "auth-policy",
    "title": "Authentication، Authorization وTenant isolation",
    "group": "Laravel",
    "intro": "Authentication بتثبت هوية المستخدم، وAuthorization بتحدد صلاحياته في action على resource معينة. Role بتجمع permissions، لكن ownership وtenant membership وحالة الحساب قواعد إضافية لازم تتحقق وقت الطلب.",
    "how": "Guard بيحدد auth mechanism، وprovider يجيب user من storage. Policy بتنظم model actions؛ token ability بتضيّق capabilities لكنها مش permission نهائية لكل object. Resolve resource في tenant scope ثم نفّذ policy، واختبر مسارات الرفض.",
    "when": "استخدم policies بدل role string checks متفرقة في controllers. خطط لتغير العضوية وrevocation؛ JWT أو bearer token موجود مش معناه صلاحية ثابتة للأبد.",
    "code": "$invoice = $tenant->invoices()->findOrFail($invoiceId);\nGate::authorize('view', $invoice);\nreturn new InvoiceResource($invoice);\n// Policy checks actor, membership, action and resource state.\n// Test another user, another tenant, revoked membership and anonymous access.",
    "walkthrough": [
      "الـquery بتحدد resource في نطاق مناسب، والـpolicy بتراجع action نفسها؛ الاتنين مكملين لبعض.",
      "Opaque ID أو UUID مش بديل عن checks؛ ده بس يقلل سهولة التخمين."
    ],
    "trap": "JWT decoded payload مش verified، وsignature validation مش بديل عن current authorization.",
    "check": "لو token فيه orders:read لكن المستخدم خرج من الشركة، إيه اللي يمنع الوصول؟"
  },
  {
    "id": "queues",
    "title": "Queues، Retries وAt-least-once processing",
    "group": "Laravel",
    "intro": "Queue بتفصل وقت استقبال الطلب عن تنفيذ شغل ممكن يتأخر، زي export أو notification. ده مش بيقلّل الشغل الكلي تلقائيًا؛ بينقله لـworkers وسعة محتاجة متابعة. Job ممكن تتنفّذ تاني بعد failure أو timeout، فافترض تكرار التنفيذ.",
    "how": "صمّم payload صغيرة بـIDs وtenant context، وحدد timeout وretry budget وbackoff. خلي الآثار idempotent، وراقب failed jobs وoldest job age. timeout الخاص بالـworker وretry_after محتاجين تناسق مع transport semantics.",
    "when": "مناسبة للشغل الطويل القابل للتأجيل. Business invariant مطلوبة قبل قبول request لازم تتفرض في مكانها، مش تتساب لـjob اختيارية من غير حالة pending واضحة.",
    "code": "final class GenerateInvoice implements ShouldQueue {\n    public int $tries = 3;\n    public int $timeout = 60;\n    public function __construct(public int $orderId) {}\n    public function backoff(): array { return [10, 30, 90]; }\n    public function handle(InvoiceGenerator $generator): void {\n        $generator->generateOnceFor($this->orderId);\n    }\n}",
    "walkthrough": [
      "generateOnceFor اسم يعكس requirement للـidempotency؛ لازم implementation تحققها بقيد durable وatomic state.",
      "tries/backoff بيتحكموا في المحاولات، لكنهم مش يمنعوا double side effects لو أول محاولة نفذت وبعدين ماتت."
    ],
    "trap": "Queue::fake بيختبر dispatch intent، مش إنه worker نفذ الكود أو provider استجاب صح.",
    "check": "إيه اللي يحصل لو job خلصت أثرها الخارجي ثم process ماتت قبل acknowledgment؟"
  },
  {
    "id": "events",
    "title": "Events، Listeners وCommit timing",
    "group": "Laravel",
    "intro": "Event بتحكي fact حصلت زي OrderPlaced، وJob/Command بتطلب شغل زي GenerateInvoice. فصل المعنيين بيساعدك تحدد ownership وتقلّل coupling، لكن إضافة listener مش ضمان execution أو durable delivery.",
    "how": "لو job اتبعتت قبل commit، worker ممكن يقرأ records لسه مش موجودة أو اتعملها rollback بعد كده. afterCommit بيحل timing ده، لكن crash بين DB commit وenqueue لسه محتاج outbox لو فقد الرسالة غير مقبول.",
    "when": "استخدم events للـside effects المفصولة عن core invariant. خلي listener idempotent وحدد failures بتتراقب إزاي؛ broadcast authorization وقواعد payload مهمة لو الـevent بتوصل للـclients.",
    "code": "DB::transaction(function () use ($orderData) {\n    $order = Order::create($orderData);\n    SendOrderReceipt::dispatch($order->id)->afterCommit();\n});\n// For durable intent: persist an outbox row in this transaction instead.",
    "walkthrough": [
      "Rollback يمنع after-commit dispatch، فمش هتبعت receipt لـorder اتلغى إنشاؤها.",
      "الرسالة الخارجية ومعلومة order مش transaction واحدة؛ outbox بيعالج dispatch durability لما ده requirement."
    ],
    "trap": "Critical totals أو inventory rules مينفعش تعتمد على optional listener ممكن يتعطل من غير ملاحظة.",
    "check": "إيه الفرق بين event fact وcommand request في naming والـresponsibility؟"
  },
  {
    "id": "cache",
    "title": "Caching، Invalidation وCache stampede",
    "group": "Laravel",
    "intro": "Cache نسخة مشتقة تسرّع القراءة، ومش المفروض تبقى مصدر الحقيقة للـbusiness data الحرجة. Cache-aside بتقرأ cache الأول، وعند miss تجيب من المصدر وتخزن. لازم تحدد key dimensions وTTL وسياسة invalidation حسب freshness المطلوبة.",
    "how": "لو بيانات tenant أو locale أو permissions بتغيّر النتيجة، key لازم يعكسها. لما hot key تنتهي، requests كتير ممكن تضرب DB مع بعض؛ lock أو stale-while-revalidate وTTL jitter يقللوا stampede، مع fallback واضح.",
    "when": "مناسب للـcatalog والـaggregates المسموح لها stale interval. checkout pricing أو permissions الحساسة محتاجة authoritative check حسب requirements، حتى لو صفحة العرض cached.",
    "code": "$key = \"tenant:{$tenantId}:catalog:v2\";\n$catalog = Cache::remember($key, now()->addMinutes(5), function () use ($tenantId) {\n    return Product::forTenant($tenantId)->select('id', 'name')->get();\n});\n// Invalidate after successful writes; assess stale-reader races separately.",
    "walkthrough": [
      "tenant dimension تمنع مشاركة نتيجة بين شركات، وselect بيحدّ البيانات اللي بتتحفظ.",
      "remember لوحدها مش stampede lock ولا strong consistency؛ ده مثال cache-aside مبسط."
    ],
    "trap": "TTL مش ضمان لصحة السعر أو صلاحية الوصول، وRedis logical DBs مش resource isolation قوية.",
    "check": "لو 2000 request وصلت بعد expiry في نفس الثانية، مين يعيد بناء القيمة وإيه fallback الباقي؟"
  },
  {
    "id": "sessions",
    "title": "Sessions، Cookies وConcurrent state",
    "group": "Laravel",
    "intro": "Session بتربط requests متعددة بسياق مستخدم عبر session identifier، غالبًا في cookie. Server-side store بيسهّل مشاركة state بين instances، لكن security attributes وexpiry وregeneration وconcurrent updates محتاجين تصميم مستقل.",
    "how": "Regenerate session ID بعد login لتقليل fixation. Logout ينهي guard session ويinvalidate البيانات ويجدّد CSRF token. Secure وHttpOnly وSameSite ليهم أدوار مختلفة، ومفيش attribute منهم علاج لكل XSS أو CSRF.",
    "when": "مناسبة للـfirst-party browser apps. متحطش cart مالية مهمة في session من غير lost-update strategy؛ two requests ممكن يكتبوا snapshots فوق بعض حتى لو store مشتركة.",
    "code": "// After successful authentication:\n$request->session()->regenerate();\n// On logout:\nAuth::logout();\n$request->session()->invalidate();\n$request->session()->regenerateToken();",
    "walkthrough": [
      "Regeneration بتغيّر session identifier بدل الاستمرار بمعرّف attacker ممكن يكون فرضه قبل login.",
      "Server-side invalidation وسياسة token revocation حاجتين مختلفتين؛ راجع كل auth mechanism مستخدمة."
    ],
    "trap": "HttpOnly بيمنع JS من قراءة cookie، لكنه مش بيمنع XSS من تنفيذ requests باسم المستخدم.",
    "check": "إزاي تختبر إن session قديمة مبقتش قادرة تستخدم endpoint محمية بعد logout؟"
  },
  {
    "id": "storage",
    "title": "File Storage، Uploads وPrivate access",
    "group": "Laravel",
    "intro": "رفع ملف بيجمع validation وresource limits وstorage وaccess control. اسم الملف وContent-Type من client مش دليل موثوق على المحتوى، ووجود file في disk مش معناه ينفع أي حد يوصله.",
    "how": "قيّد الحجم والنوع بعد content inspection، استخدم server-generated paths، وخزن private files بعيد عن executable/public directories. قدّم download بعد policy أو signed bearer-link design صريح له expiry. أضف cleanup للـabandoned uploads.",
    "when": "مناسب للفواتير والصور والتقارير. Direct-to-object-storage uploads تقلل ضغط app workers، لكن finalize step لازم تتأكد من ownership والحجم والنوع بدل الثقة في URL issuance وحده.",
    "code": "$request->validate(['document' => ['required', 'file', 'max:5120', 'mimes:pdf']]);\n$path = $request->file('document')->store('invoices', 'private');\n// Persist metadata and ownership using an explicit application action.\n// Download later: authorize invoice, then stream from the private disk.",
    "walkthrough": [
      "ده مثال على limits والتخزين، والـprivate disk لازم تتعرّف في config؛ rule مش substitute لـmalware policy لو مطلوبة.",
      "Metadata بتربط path بالـowner، ومش بنستخدم raw filename كـfilesystem path."
    ],
    "trap": "URL صعب التخمين مش authorization؛ وSVG أو active content محتاج سياسة تقديم آمنة.",
    "check": "مين بينظّف الملفات اللي اتحفظت لكن DB transaction فشلت قبل حفظ metadata؟"
  },
  {
    "id": "localization",
    "title": "Localization، Blade وNotifications",
    "group": "Laravel",
    "intro": "Localization أكبر من ترجمة words: فيها locale واتجاه النص وتنسيق money/timezone وfallbacks. Blade templates بتعرض data في سياق HTML، وescaped output هو الاختيار الافتراضي لمدخلات غير موثوقة.",
    "how": "الـqueued notification مش عندها request locale تلقائي موثوق؛ احمل recipient locale أو resolve صريح. افصل النص المترجم عن user content، وراجع output context: HTML escaping مش نفس JavaScript أو URL encoding.",
    "when": "مناسبة لأي تطبيق عربي/إنجليزي ورسائل user-specific. اختبر rendering للغتين والمفقود من translations، ومتسيبش locale mutable state تتسرب بين jobs.",
    "code": "// In an application action:\n$user->notify((new OrderConfirmed($order->id))->locale($user->locale));\n// In a Blade view:\n// <h1>{{ __('orders.confirmed') }}</h1>\n// <p>{{ $customerName }}</p>\n// Avoid raw {!! $untrustedHtml !!} unless deliberately sanitized.",
    "walkthrough": [
      "الـlocale مرتبطة بالمستلم مش worker default، وده مهم لما workers تخدم مستخدمين بلغات مختلفة.",
      "Escaped Blade output بيخلي اسم العميل data، بدل HTML قابلة للتنفيذ."
    ],
    "trap": "ترجمة تاريخ UTC كنص من غير timezone policy ممكن تعرض للمستخدم موعد غلط رغم ترجمة الكلمات.",
    "check": "إيه الفرق بين اختبارات dispatch notification واختبارات template rendering والـtransport؟"
  },
  {
    "id": "artisan",
    "title": "Artisan، Scheduler وIdempotent operations",
    "group": "Laravel",
    "intro": "Console command طريق لتشغيل use case من CLI، والـScheduler بيحدد توقيتها. نفس business rules لازم تتحافظ عليها سواء النداء من HTTP أو command؛ متكررهاش في مكانين بقواعد مختلفة.",
    "how": "Commands الطويلة محتاجة validated args وdry-run وbatches وcheckpoints وexit codes. onOneServer بيدير multi-server scheduling، وwithoutOverlapping بيحد overlap؛ supported shared lock store وexpiry مهمين، والعملية نفسها لسه محتاجة idempotency.",
    "when": "مناسب للـbackfills والـcleanup والتقارير. ابدأ بحدود load صغيرة ومراقبة، وتجنب transaction واحدة لملايين rows.",
    "code": "Schedule::command('invoices:reconcile --batch=100')\n    ->everyFiveMinutes()\n    ->onOneServer()\n    ->withoutOverlapping(10);\n// The command also persists a cursor and safely tolerates reruns.\n// Shared supported cache/locks must be configured across schedulers.",
    "walkthrough": [
      "الـlocks بتنسّق التشغيل؛ الـcursor وidempotency بيسمحوا باستكمال آمن بعد crash أو expiry.",
      "قيمة overlap expiry لازم تناسب duration والفشل؛ lock ضاعت مش دليل إن الشغل خلص."
    ],
    "trap": "Scheduler success log مش proof إن كل business record اتعالج صح؛ تابع النتائج والـfailed work.",
    "check": "إزاي تخلي command تقدر تتوقف وتتفتح تاني من غير تكرار الأثر أو تفويت صفوف؟"
  },
  {
    "id": "deploy",
    "title": "Deployment، Expand–contract وRelease safety",
    "group": "Laravel",
    "intro": "Deployment تغيير منسّق في code وdependencies وschema وconfig وworkers، مش مجرد رفع files. Old وnew instances ممكن يخدموا في نفس الوقت، فالتوافق خلال الانتقال مهم زي correctness بعده.",
    "how": "Expand–contract بتضيف schema متوافقة، تعمل backfill تدريجي، تغيّر القراءة/الكتابة، وبعد نجاح الانتقال تزيل القديم. Queue workers وlong-lived HTTP workers محتاجين reload/restart مناسب، والـcached config لازم تتبني بقيم البيئة الصحيحة.",
    "when": "مناسب للأنظمة اللي التوقف فيها مكلف. حدد health/readiness وmetrics وrollback أو forward-fix strategy، ومتفترضش إن Git revert بيرجّع data اللي migrations أو jobs غيرتها.",
    "code": "// Illustrative release sequence:\n// 1. Test + build immutable artifact from locked dependencies.\n// 2. Apply backward-compatible migration.\n// 3. Deploy code; run bounded backfill if required.\n// 4. Gracefully restart workers and verify health/queue lag.\n// 5. Remove old schema only in a later safe release.",
    "walkthrough": [
      "فصل إضافة schema عن إزالة القديم بيخلي rolling releases والـrollback أكثر أمانًا.",
      "نهاية build مش نهاية verification؛ راقب user-impact metrics بعد traffic switch."
    ],
    "trap": "migrate:rollback ممكن يمسح data جديدة أو يكسر old/new compatibility؛ مش زرار أمان عام.",
    "check": "إيه اللي يمنع job قديمة في queue من الفشل لما class أو payload contract يتغير؟"
  },
  {
    "id": "http",
    "title": "HTTP، DNS، TLS وNetwork boundaries",
    "group": "Backend",
    "intro": "قبل ما request تدخل Laravel، فيه DNS resolution واتصال وتحقق TLS وreverse proxy routing. HTTP contract بيوصف method وheaders وbody وstatus، بينما network reliability حاجة تانية: request ممكن تضيع أو response تتأخر بعد تنفيذ أثر فعلي.",
    "how": "وزّع end-to-end deadline على dependencies، وميّز connect timeout عن waiting response. CORS browser access policy، وCSRF بيستغل credentials اللي browser بيبعتها تلقائيًا؛ ولا واحد فيهم بديل عن authorization.",
    "when": "مهم لتشخيص latency و502/504 واختيار cookies/tokens، وتصميم retries آمنة. ابدأ بقياس كل layer بدل زيادة timeouts عشوائيًا.",
    "code": "// Illustrative Laravel HTTP client boundary:\n$response = Http::connectTimeout(2)->timeout(5)->get($trustedUrl);\nif (!$response->successful()) { /* map to a domain error */ }\n// Validate decoded body shape; HTTP 200 does not prove valid business data.\n// A write retry additionally needs an idempotency strategy.",
    "walkthrough": [
      "الـURL لازم تتحدد من trusted configuration أو validated allowlist؛ timeout مش SSRF defense.",
      "timeout budget لازم يراعي proxy/client deadline، عشان متفضلش عملية شغالة بعد ما caller فقد الأمل."
    ],
    "trap": "TLS بيحمي النقل للطرف المتحقق منه، ومش بيصلّح unsafe input أو ضعف permissions.",
    "check": "لو provider رد بعد client timeout، هل تقدر تعتبر العملية فشلت وتبدأ واحدة جديدة؟"
  },
  {
    "id": "rest-api",
    "title": "API Contracts، Resources وHTTP semantics",
    "group": "Backend",
    "intro": "API contract اتفاق بين caller والسيرفر على data وerrors وsemantics والتوافق. API Resource بتعزل public representation عن Model fields الداخلية، لكن pagination والـauthorization والـversion policy أجزاء مستقلة من نفس التصميم.",
    "how": "GET للقراءة، PUT عادة لاستبدال representation وidempotent بالمعنى المقصود للأثر، PATCH للتعديل الجزئي حسب operation، وPOST للإنشاء أو action حسب contract. Status codes لازم تعكس الحالة، وerror envelope ثابت يسهل تعامل client.",
    "when": "استخدم allowlists للـfields والـsorting، وحدّ query cost. خطط additive changes قبل breaking version، واحتفظ باختبارات contract للـclients المدعومة.",
    "code": "return OrderResource::collection(\n    Order::forTenant($tenant->id)\n        ->with('customer')\n        ->orderBy('id')\n        ->paginate(25)\n);\n// 422: invalid input; 401: unauthenticated; 403: forbidden.\n// Choose 404 concealment consistently where the access policy requires it.",
    "walkthrough": [
      "Resource بتحدد fields بدل exposure تلقائي لكل column جديدة، وpagination بتحمي payload size.",
      "401/403/404 قرارات contract وأمان؛ متحاولش تعالج كل failure بـ200 مع success=false من غير تصميم واضح."
    ],
    "trap": "Idempotent HTTP method مش وعد إن كل log أو external side effect حصل مرة واحدة.",
    "check": "إزاي تغيّر اسم response field وفيه mobile clients قديمة لسه شغالة؟"
  },
  {
    "id": "sql-indexes",
    "title": "Indexes، Query plans وN+1",
    "group": "Database",
    "intro": "Index structure بتسرّع access patterns محددة، مقابل مساحة وتكلفة write وصيانة. Composite index بيتأثر بترتيب الأعمدة ونوع predicates والـsort والـselectivity. إضافة index لكل عمود لوحده مش بالضرورة تحل نفس query.",
    "how": "ابدأ بـquery حقيقية وEXPLAIN/EXPLAIN ANALYZE على بيانات ممثلة؛ شوف rows scanned والـsort والـlock waits. N+1 مشكلة عدد round trips بسبب relationship lazy loading، مش مجرد missing index.",
    "when": "استخدم eager loading للعلاقات المطلوبة، وDB filtering/aggregates بدل تحميل كل records، وحدد result grain قبل joins عشان totals متتضاعفش من fan-out.",
    "code": "-- Candidate for equality filters + ordering; measure, do not assume:\nCREATE INDEX orders_tenant_status_created\nON orders (tenant_id, status, created_at);\n-- Inspect a representative SELECT plan before and after.\n-- In Eloquent, use with('customer') to avoid per-order customer queries.",
    "walkthrough": [
      "الـindex candidate مفيد لو query shape والـselectivity مناسبين؛ لازم تقيس read/write impact.",
      "قلة queries مش ضمان سرعة: query واحدة ممكن تعمل scan ضخم أو ترجع data أكتر من اللازم."
    ],
    "trap": "Benchmark على 10 rows مش proof لسلوك production، وaverage latency ممكن يخبي tail latency.",
    "check": "لو endpoint فيها query واحدة بطيئة، إيه metrics غير query count هتراجعها؟"
  },
  {
    "id": "transactions",
    "title": "Transactions، ACID وIsolation",
    "group": "Database",
    "intro": "Transaction بتجمع participating database operations في unit commit/rollback. Atomicity تمنع partial commit، وConsistency مرتبطة بالقواعد المفروضة، وIsolation بتحدد تداخل المعاملات، وDurability حسب ضمانات المحرك والتهيئة. ده مش blanket guarantee لكل race.",
    "how": "Isolation levels تسمح أو تمنع anomalies مختلفة حسب engine ونوع القراءة. Read snapshot مش دايمًا هي locking read، وexternal emails أو charges مش جزء من DB rollback.",
    "when": "استخدم transactions قصيرة حول invariants محلية، مع constraints وlocking/conditional writes حسب الاحتياج. حط side effects الخارجية في workflow له retries وreconciliation، مش جوه lock طويل منتظر network.",
    "code": "DB::transaction(function () use ($orderId) {\n    $order = Order::query()->lockForUpdate()->findOrFail($orderId);\n    if ($order->status !== 'pending') throw new DomainException();\n    $order->update(['status' => 'confirmed']);\n    // Persist local dependent records here.\n}); // Keep remote calls outside this locking transaction.",
    "walkthrough": [
      "الـlock اتاخد قبل قراءة الحالة اللي القرار معتمد عليها، واستمر لحد نهاية transaction.",
      "Exception بتلغي participating writes، لكنها مش هترجع side effect حصلت عند provider."
    ],
    "trap": "Transaction لوحدها مش بتمنع lost update في كل isolation level أو كل read/write pattern.",
    "check": "إيه الفرق بين atomicity لمعاملة محلية وatomicity لعملية عبر DB وpayment provider؟"
  },
  {
    "id": "race",
    "title": "Race Conditions، Locks وOptimistic concurrency",
    "group": "Database",
    "intro": "Race بتحصل لما correctness تعتمد على interleaving طلبات أو workers. مثال read stock ثم decrement من طلبين على آخر قطعة؛ الاتنين شافوا نفس القيمة وقرروا البيع. لازم القرار والكتابة يتنسقوا atomically.",
    "how": "Pessimistic locking بيمسك row أثناء transaction قصيرة. Optimistic concurrency بتقارن version في نفس UPDATE وترفض لو اتغيّرت. Conditional atomic update ممكن يحمي invariant مباشرة وتفحص affected rows.",
    "when": "اختار حسب contention وduration وتجربة المستخدم. Deadlocks متوقعة في بعض الأنظمة، فاعمل consistent lock order وbounded retry آمن، واختبر على production DB engine باتصالات مستقلة.",
    "code": "$changed = DB::table('inventory')\n    ->where('id', $productId)\n    ->where('stock', '>=', $quantity)\n    ->decrement('stock', $quantity);\nif ($changed !== 1) throw new OutOfStock();\n// If more local records must be committed together, wrap that unit in a transaction.",
    "walkthrough": [
      "شرط stock والـdecrement جزء من database statement واحدة؛ مفيش read منفصلة تخلق stale decision هنا.",
      "لو محتاج إنشاء order reservation بنفس الضمان، اجمع local writes داخل transaction مناسبة."
    ],
    "trap": "قفل Redis له expiry ممكن يضيع؛ مش بديل تلقائي عن DB constraints أو durable idempotency.",
    "check": "إزاي هتكتب concurrent test يكشف overselling بدل sleep عشوائي؟"
  },
  {
    "id": "idempotency",
    "title": "Idempotency وUnknown outcomes",
    "group": "Payments",
    "intro": "Idempotency معناها تكرار نفس العملية المنطقية مايكررش intended business effect. ده مهم لأن delivery عادة at least once، والـtimeout ممكن يحصل بعد نجاح العملية الخارجية. النتيجة المجهولة محتاجة متابعة، مش افتراض فشل.",
    "how": "احفظ key scoped للـactor والـoperation ومعاها fingerprint للـpayload وحالة processing/result. Unique constraint تحسم أول محاولتين concurrent. نفس key مع payload مختلف تترفض، وإعادة المحاولة ترجع نتيجة متسقة حسب retention policy.",
    "when": "مفيدة في charges/refunds وwebhook fulfillment وإنشاء workflows الحساسة. key ثابتة لكل logical attempt، مع mapping واضح لمفتاح provider وحدود ضمانه.",
    "code": "// Database invariant, illustrative:\n$table->unique(['tenant_id', 'operation', 'idempotency_key']);\n// Request flow:\n// 1. Atomically claim key + request fingerprint.\n// 2. Return/reconcile existing result for duplicates.\n// 3. Call provider with the SAME provider key on safe retry.\n// 4. Persist final state; handle pending/unknown outcomes explicitly.",
    "walkthrough": [
      "check exists ثم insert من غير constraint لسه فيها race؛ DB uniqueness هي الحكم تحت concurrency.",
      "الـclaim لوحدها مش exactly-once external execution: crash windows والـprovider guarantees لازم يدخلوا في design."
    ],
    "trap": "إنشاء idempotency key جديدة مع كل retry ممكن يخصم أو يرد مبلغ مرتين.",
    "check": "لو الـrequest timed out لكن webhook أكدت النجاح، إزاي تمنع retry تعمل charge جديدة؟"
  },
  {
    "id": "outbox",
    "title": "Transactional Outbox وReliable delivery",
    "group": "Payments",
    "intro": "Outbox بتحل مشكلة dual write: DB commit تنجح لكن نشر message يفشل، أو العكس. بتكتب business state وrecord للـmessage intent في نفس transaction، وبعدها publisher يحاول يرسل intent من storage الموثوق.",
    "how": "Publisher ممكن يموت بعد publish وقبل mark sent، فالرسالة ممكن تتبعت تاني. عشان كده consumer لازم idempotent، والـoutbox محتاجة claiming/concurrency وretries وmonitoring وretention.",
    "when": "استخدمها لما فقد dispatch بعد commit غير مقبول، زي fulfillment أو financial integration. للشغل البسيط afterCommit ممكن يكون كافي حسب requirement؛ اختار reliability بدل إضافة pattern عشوائي.",
    "code": "DB::transaction(function () use ($payment) {\n    $payment->markCaptured();\n    OutboxMessage::create([\n        'event_id' => (string) Str::uuid(),\n        'type' => 'payment.captured',\n        'aggregate_id' => $payment->id,\n    ]);\n});\n// A separate publisher retries unsent messages; consumers deduplicate event_id.",
    "walkthrough": [
      "الـintent والحالة المحلية يتكتبوا مع بعض، فممكن تستعيد الشغل بعد crash بدل الاعتماد على ذاكرة process.",
      "mark sent مش transaction مع broker عادة؛ duplicate publication احتمال تصميمي لازم consumer تتحمله."
    ],
    "trap": "Outbox بتدي durable intent وeventual delivery تحت افتراضات التشغيل، مش exactly-once لكل أثر خارجي.",
    "check": "إيه metrics اللي تكشف إن outbox publisher متعطل حتى لو web requests سليمة؟"
  },
  {
    "id": "security",
    "title": "Security boundaries وDefense in depth",
    "group": "Backend",
    "intro": "Security تبدأ بتحديد assets وactors وtrust boundaries: مين يقدر يبعت input، مين يملك record، وإيه اللي ممكن يتسرّب أو يتنفذ أو يستهلك resources. controls لازم تترابط بالتهديد بدل الاعتماد على اسم package أو checklist بس.",
    "how": "Parameterize SQL values واعمل allowlist للـidentifiers، encode output حسب context ضد XSS، وامنع unsafe URL fetches ضد SSRF. Secrets تتخزن وتدور بصلاحيات محدودة، وlogs لازم تتعملها redaction.",
    "when": "في كل feature جديدة، اختبر unauthorized paths وmalformed input وoversized work، وحط quotas/timeouts. Password hashing حاجة مختلفة عن reversible encryption، وTLS حاجة مختلفة عن authorization.",
    "code": "$sortColumns = ['newest' => 'created_at', 'name' => 'name'];\n$sort = $sortColumns[$request->string('sort')->toString()] ?? 'created_at';\n$query->where('email', $validatedEmail)->orderBy($sort);\n// Values are bound; SQL identifiers come only from the fixed allowlist.\n// Tenant scope and policy checks still apply separately.",
    "walkthrough": [
      "Bound values بتحمي SQL data positions، والـmap تمنع client من حقن arbitrary sort expression.",
      "الكود مش بيقول إن أي مستخدم يقدر يعمل query على أي tenant؛ checks الخاصة بالـresource لسه مطلوبة."
    ],
    "trap": "UUID وCORS وencrypted payload مش بدائل عن permission checks، وdeleting a leaked secret من Git مش revocation.",
    "check": "إيه threat model لendpoint بتقبل URL وتعمل fetch من السيرفر؟"
  },
  {
    "id": "testing",
    "title": "Testing boundaries وIndependent verification",
    "group": "Backend",
    "intro": "Test مفيدة لو هتفشل على defect حقيقي أو contract مكسورة. Unit بتعزل rule، Feature تختبر delivery path والـauth والـresponse، وIntegration تختبر boundary فعلية زي DB behavior أو provider adapter. الاسم وحده مش proof للـscope.",
    "how": "اكتب expected outcomes من requirements مش من نسخ implementation. Mock external boundaries بدل method اللي بتختبرها، واستخدم fixtures فيها negative/edge cases. DB engine وtime/cache/files ممكن يؤثروا على isolation والـconcurrency tests.",
    "when": "اختبر rules محليًا، وconstraints وauthorization عبر paths حقيقية، وprovider compatibility في sandbox منفصلة. Regression test لازم تفشل قبل fix وتنجح بعدها.",
    "code": "it('denies another tenant without mutating the invoice', function () {\n    $this->actingAs($otherTenantUser)\n        ->patchJson(\"/api/invoices/{$invoice->id}\", ['status' => 'paid'])\n        ->assertNotFound(); // follows this API's scoped-resource policy\n    expect($invoice->fresh()->status)->toBe('pending');\n});",
    "walkthrough": [
      "Status assertion لوحدها مش كفاية: بنتأكد إن forbidden request ماعملتش mutation قبل الرفض.",
      "الـfixture لازم فعلًا تملك users وtenants مختلفين، مش IDs accidentally بتشير لنفس النطاق."
    ],
    "trap": "SQLite tests مش proof على MySQL row-lock semantics، وHttp::fake مش proof إن provider API ما اتغيرتش.",
    "check": "إيه اللي يخلي regression test تنجح قبل إصلاح bug، وإزاي تصلّح الاختبار؟"
  },
  {
    "id": "observability",
    "title": "Logs، Metrics، Traces وIncident reasoning",
    "group": "Backend",
    "intro": "Observability بتديك أدلة عن النظام: metrics للاتجاهات والـalerts، logs للأحداث والـcontext، وtraces لربط خطوات request عبر dependencies. الهدف فهم أثر المستخدم والـbottleneck، مش مجرد تجميع كل payload في log.",
    "how": "راقب latency percentiles وerror rate وthroughput وsaturation وqueue lag. Correlation ID تربط الطلب بالـjob والـprovider reference. اختار metric labels محدودة cardinality، ومتستخدمش كل user ID كlabel.",
    "when": "مهمة في slow checkout وtenant-specific failures والتأكد من release. ابدأ بفرضية قابلة للتحقق، اعمل reproduce ببيانات sanitized، وطبّق mitigation قابلة للرجوع مع قياس أثرها.",
    "code": "Log::warning('payment_pending', [\n    'request_id' => $requestId,\n    'payment_id' => $paymentId,\n    'error_category' => 'provider_timeout',\n]);\n// No auth headers, card data, reset tokens or raw provider payloads.\n// Pair logs with p95 latency, error-rate and reconciliation-age metrics.",
    "walkthrough": [
      "الـevent واضح ومصنف، فممكن تربطه بالـtrace من غير تسريب secrets.",
      "queue depth لوحدها مش كفاية؛ oldest job age تكشف شغل مستني من زمان حتى لو العدد صغير."
    ],
    "trap": "Average latency ممكن تبقى كويسة ونسبة من المستخدمين تعاني جدًا؛ ومتعملش APP_DEBUG للعامة عشان تحقق.",
    "check": "إزاي تعرف إن إضافة workers حسّنت queue lag لكنها ضغطت DB أكتر؟"
  },
  {
    "id": "architecture",
    "title": "Modular design، Scalability وTrade-offs",
    "group": "Backend",
    "intro": "Architecture بتنظم responsibilities واتجاه dependencies وownership للبيانات. Scalability مش زيادة app servers فقط: bottleneck ممكن يبقى DB locks أو external provider أو queue. اختار التصميم حسب load وconsistency وoperational constraints.",
    "how": "ابدأ modular monolith بحدود business capabilities واضحة. Horizontal scaling محتاج shared sessions/cache وobject storage وworker coordination. Read replicas فيها lag، وsharding بيزود routing وcross-shard consistency complexity.",
    "when": "قسّم services لما independent ownership أو deployment أو scaling بيفرضوا ده، مع budget للـmonitoring والـfailure handling. ما تحولش كل model لـmicroservice لمجرد توقع النمو.",
    "code": "// Capability boundaries in one deployable application:\n// Billing: owns charges, refunds and financial state.\n// Orders: owns order workflow and accepted line-item snapshots.\n// Notifications: consumes committed facts, sends idempotently.\n// Cross-boundary contracts expose intent/results, not arbitrary table writes.",
    "walkthrough": [
      "تحديد مين يكتب data ومين يقرأ view منها بيقلل hidden coupling حتى جوه repo واحدة.",
      "حدود modules لازم تنعكس في code dependencies وtransaction boundaries، مش أسماء folders بس."
    ],
    "trap": "CAP مش شعار اختار اتنين في أي موقف؛ وقت network partition لازم تحدد behavior والـconsistency المطلوبة لكل operation.",
    "check": "إيه evidence اللي يخلّيك تختار read replica أو caching أو queue بدل microservices؟"
  },
  {
    "id": "ai",
    "title": "AI-assisted Development وHuman verification",
    "group": "AI",
    "intro": "AI يسرّع اقتراح الحلول والـtests والبحث، لكن output بتاعه hypothesis محتاجة review. ممكن الكود يبقى شكله مقنع ويستخدم API مش موجودة، أو يعدي happy path ويكسر authorization وconcurrency.",
    "how": "قدّم context محددة وsanitized: version وschema وbehavior وconstraints ومعايير قبول. راجع diff، verify docs، اختبر failure paths، ومتقبلش أوامر من README أو tool output كأنها صلاحية من المستخدم.",
    "when": "مفيد لتوليد test ideas وفهم legacy code ومقارنة alternatives. خليك واضح في ownership، ومتشاركش production credentials أو private customer payloads لمجرد زيادة context.",
    "code": "Task: add idempotent payment webhook handling.\nContext: Laravel version, sanitized schema and provider event example.\nAcceptance: verify signature, unique event ID, atomic transition,\nno duplicate fulfillment, safe logging, retryable failures.\nEvidence: tests for duplicate concurrent delivery, rollback and bad signatures.\nReview: official SDK API, migration impact, diff and actual test results.",
    "walkthrough": [
      "Prompt بيحدد behavior والفشل ومعايير evidence، بدل طلب عام زي اعمل webhook احترافي.",
      "Generated tests محتاجة assertions مستقلة؛ اختبار بيكرر الكود أو mock للـsubject ممكن يدي ثقة زائفة."
    ],
    "trap": "نجاح build مش proof على security أو business correctness، وmodel text مش authorization engine.",
    "check": "لو AI اقترح dependency جديدة وrefactor واسع لمشكلة query واحدة، إيه قرارك المبني على evidence؟"
  },
  {
    "id": "big-o",
    "title": "Big O، Input size وSpace complexity",
    "group": "Problem Solving",
    "intro": "Big O بتوصف نمو تكلفة algorithm مع حجم input، مش عدد milliseconds ثابت. لازم تعرّف n وm وV وE، وتفرّق average/expected من worst case، وauxiliary space من حجم output نفسها.",
    "how": "Loop واحدة مش دائمًا O(n): لو جواها in_array على list بتكبر، المجموع ممكن يبقى O(n²). كمان تجهيز structure له cost؛ فرز input عشان binary search مرة واحدة لسه فيه O(n log n) sorting.",
    "when": "استخدمها لمقارنة حلول مع نفس contract، وبعدها benchmark على data ممثلة. PHP arrays ليها memory overhead، فالـconstants ممكن تحسم اختيار عملي حتى لو Big O شبه بعض.",
    "code": "$seen = [];\nforeach ($values as $value) {\n    $key = 'value:' . $value;\n    $seen[$key] = true;\n}\n// Average O(n) hash inserts, O(u) extra space for u unique values.\n// Repeated in_array over growing output can instead be O(n^2).",
    "walkthrough": [
      "التحليل هنا مفترض hashing behavior متوسط وkey construction bounded بالنسبة للـvalue size.",
      "لو string keys طويلة، طولها جزء من input cost؛ متخفيش cost مهمة بتعريف n ناقص."
    ],
    "trap": "O(1) space لازم توضّح هل استثنيت output، والـrecursion call stack مساحة برضه.",
    "check": "إيه time وspace complexity لحل بيعمل sort ثم two-pointer scan؟"
  },
  {
    "id": "hash-maps",
    "title": "Hash Maps، Sets وFrequency counting",
    "group": "Problem Solving",
    "intro": "Hash map بتربط key بقيمة لlookup سريع في المتوسط، وset بتستخدم نفس الفكرة لوجود/غياب key. Frequency map بتخزن عدد مرات الظهور، فتنفع للـdedup وanagrams وprefix-sum counting.",
    "how": "حافظ على invariant واضحة: هل map فيها كل العناصر السابقة ولا الحالية كمان؟ Two Sum لازم lookup قبل insertion عشان متستخدمش نفس index مرتين. وPHP key coercion ممكن يجمع مفاتيح كنت فاكرها مختلفة.",
    "when": "مناسبة للـmembership والـcounting في data محدودة. مع cardinality ضخمة، memory أو external aggregation يبقوا جزء من الحل، ومش كل hash lookup worst-case O(1).",
    "code": "$seen = [];\nforeach ($numbers as $index => $number) {\n    $complement = $target - $number;\n    if (array_key_exists($complement, $seen)) {\n        return [$seen[$complement], $index];\n    }\n    $seen[$number] = $index;\n}",
    "walkthrough": [
      "قبل كل iteration، map فيها indices من prefix السابق فقط، فكل pair راجعة distinct indices.",
      "الـcontract مفترض integers وحساب representable؛ للـstring IDs استخدم identity normalization مقصودة."
    ],
    "trap": "In-memory set مش deduplication موزعة بين workers؛ هناك محتاج durable unique constraint.",
    "check": "ليه frequency[0]=1 مهمة في عدّ subarrays باستخدام prefix sums؟"
  },
  {
    "id": "two-pointers",
    "title": "Two Pointers وLoop invariants",
    "group": "Problem Solving",
    "intro": "Two pointers تقنية لتنظيم المرور على input بدل إعادة scan مرات كتير. ممكن pointer لكل list مرتبة، أو left/right داخل array. السر في إثبات invariant مش مجرد استخدام متغيرين.",
    "how": "في merge sorted lists، output دائمًا merge مرتبة للـprefixes المستهلكة. اختار أصغر عنصر متاح وحرّك pointer واحدة؛ كل عنصر يُستهلك مرة. نفس الفكرة بتفيد في comparisons على ordered data مع شروط مختلفة.",
    "when": "مناسبة لما ordering أو partition property تسمح باستبعاد خيارات من غير الرجوع لورا. لو input مش sorted، cost والـmutation بتوع sorting لازم يتحسبوا.",
    "code": "$i = 0; $j = 0; $out = [];\nwhile ($i < count($a) && $j < count($b)) {\n    if ($a[$i] <= $b[$j]) $out[] = $a[$i++];\n    else $out[] = $b[$j++];\n}\n// Append the unconsumed suffix of each input.\n// Time O(n+m); output O(n+m), auxiliary pointer state O(1).",
    "walkthrough": [
      "كل خطوة بتضيف أصغر current item، فباقي العناصر في كل list مش أصغر من الاختيار بتاعها.",
      "نسخ باقي suffix ضروري؛ انتهاء list مش معناه إن merge كلها خلصت."
    ],
    "trap": "array_shift المتكرر على lists كبيرة ممكن يغيّر complexity مقارنة بتحريك indices.",
    "check": "إزاي تثبت إن pointer بيتحرك لقدّام بس، وبالتالي مفيش element اتعالج عدد مرات غير bounded؟"
  },
  {
    "id": "sliding-window",
    "title": "Sliding Window وMonotonic boundaries",
    "group": "Problem Solving",
    "intro": "Sliding window بتحافظ على نطاق متصل وstate تلخصه، بدل تكوين كل substrings أو subarrays. عادة right بتوسّع النافذة وleft بتضيقها لاستعادة شرط، مع حركة للأمام فقط فتقدر تحلل total work.",
    "how": "لأطول substring بلا تكرار، خزن آخر index لكل character واضبط left=max(left,last+1). max تمنع left ترجع لورا لما repeat حصلت قبل النافذة الحالية. لو شرط sum مبني على أعداد موجبة، دخول negatives ممكن يكسر monotonic reasoning.",
    "when": "مناسبة للـcontiguous ranges اللي شرطها يسمح بتحديث incremental. للـtarget sum مع negatives، prefix sums وfrequency map غالبًا أنسب.",
    "code": "$last = []; $left = 0; $best = 0;\nfor ($right = 0; $right < strlen($ascii); $right++) {\n    $ch = $ascii[$right];\n    if (isset($last[$ch])) $left = max($left, $last[$ch] + 1);\n    $last[$ch] = $right;\n    $best = max($best, $right - $left + 1);\n}",
    "walkthrough": [
      "Invariant: النطاق بين left وright مفيهوش تكرار، وكل boundary متحركش لورا.",
      "ASCII contract مقصود؛ Unicode grapheme processing محتاج تمثيل مختلف عن byte indexing."
    ],
    "trap": "المثال abba بيكشف bug left=last+1 من غير max، وnegative sums تكشف افتراضات window غير الصحيحة.",
    "check": "إيه الشرط اللي لازم يكون monotonic عشان تحريك left يبقى حل آمن؟"
  },
  {
    "id": "stack-queue",
    "title": "Stacks، Queues وState ordering",
    "group": "Problem Solving",
    "intro": "Stack شغالة LIFO: آخر حاجة دخلت أول حاجة تطلع، فتنفع nesting وundo وDFS. Queue شغالة FIFO: أول حاجة دخلت أول حاجة تطلع، فتنفع BFS ومعالجة طبقات. اختيار الترتيب جزء من correctness مش تفصيلة implementation.",
    "how": "Bracket validation تحتاج stack تحفظ openings؛ closing لازم تقابل آخر opening. BFS تحتاج queue وvisited وقت enqueue عشان تمنع تضخيم work. SplQueue أو head index أنسب من shift متكرر في lists كبيرة.",
    "when": "استخدم in-memory structures للتفكير داخل process. Distributed job queue فيها retry/delivery/concurrency semantics زيادة عن FIFO، ومع أكتر من worker completion order مش مضمون.",
    "code": "$queue = new SplQueue();\n$queue->enqueue([$start, 0]);\n$visited = [$start => true];\nwhile (!$queue->isEmpty()) {\n    [$node, $distance] = $queue->dequeue();\n    // Enqueue unseen neighbors with distance + 1.\n}",
    "walkthrough": [
      "FIFO بيخلّي كل nodes على distance أصغر تتعالج قبل اللي بعدها، وده أساس shortest path في unweighted graph.",
      "الـvisited تتعلم عند enqueue، مش بعد ما نفس node تكون دخلت queue من paths كتير."
    ],
    "trap": "عدد openings يساوي closings مش كفاية لضمان brackets متداخلة بالترتيب الصحيح.",
    "check": "إمتى stack صريحة تبقى أأمن من recursion عميقة جدًا؟"
  },
  {
    "id": "binary-search",
    "title": "Binary Search وMonotonic predicates",
    "group": "Problem Solving",
    "intro": "Binary search بتستبعد نصف search space كل مرة بناءً على ترتيب أو monotonic predicate. مش شرط تكون بتدوّر على equality؛ lower bound بتدور على أول index يحقق value>=target، وده مفيد مع duplicates.",
    "how": "حدد interval convention قبل الكود. Half-open [low,high) بيسمح إن الإجابة تكون n لو مفيش match. لازم كل branch تصغّر النطاق وتحافظ على invariant، وإلا ممكن infinite loop أو missed boundary.",
    "when": "مناسبة لinput sorted أو answers ليها feasibility monotonic. لو هتعمل sort مرة لكل lookup، احسب تكلفته وتأثيره على original indices.",
    "code": "$low = 0; $high = count($sorted);\nwhile ($low < $high) {\n    $mid = $low + intdiv($high - $low, 2);\n    if ($sorted[$mid] < $target) $low = $mid + 1;\n    else $high = $mid;\n}\nreturn $low; // first index >= target, possibly count($sorted)",
    "walkthrough": [
      "لما mid أقل من target نستبعد mid نفسها وكل اللي قبلها؛ otherwise نخلي mid مرشحة ونقلل high.",
      "Empty list بتبدأ low=high=0 فترجع صفر من غير access خارج الحدود."
    ],
    "trap": "الـalgorithm مفترض dense sorted list، وPHP map arbitrary keys مش نفس contract.",
    "check": "إيه tests تكشف boundary errors مع [], [2], duplicates وtarget أكبر من كل القيم؟"
  },
  {
    "id": "graphs",
    "title": "Graphs، BFS، DFS وCycle detection",
    "group": "Problem Solving",
    "intro": "Graph فيها vertices وعلاقات edges، وممكن تكون directed أو undirected وweighted أو unweighted. Dependency graph وsocial links أمثلة backend. قبل algorithm، حدد معنى edge عشان متطلعش build order بالعكس.",
    "how": "BFS للـshortest edge count في unweighted graph، وDFS للـdepth exploration. visited تمنع traversal المتكرر، لكن directed cycle detection محتاجة active/finished states أو indegree/topological processing؛ مجرد visited مش كفاية لنفس السؤال.",
    "when": "مناسبة لـdependencies وreachability وworkflow analysis. Adjacency list بتخلي traversal O(V+E) للـreachable graph، مع مراعاة disconnected components وself-loops.",
    "code": "// dependency -> dependent edges for topological processing:\n$degree = ['db' => 0, 'app' => 1];\n$next = ['db' => ['app']];\n// Queue indegree-0 nodes. Emit one, decrement its dependents.\n// If emitted count < total vertices, a cycle prevented completion.\n// Repeated dependencies should be normalized to avoid accidental duplicate edges.",
    "walkthrough": [
      "الـnode اللي indegree بتاعتها صفر جاهزة لأن كل dependencies خلصت أو مش موجودة.",
      "مفيش order صحيحة واحدة دائمًا؛ اختبر إن كل dependency قبل dependent بدل exact list واحدة."
    ],
    "trap": "DFS مش shortest-path guarantee في general graph، وBFS العادية مش weighted shortest path.",
    "check": "إزاي تتعامل مع module مذكورة dependency بس ومش موجودة كkey في input؟"
  },
  {
    "id": "dynamic-programming",
    "title": "Dynamic Programming وRecurrence design",
    "group": "Problem Solving",
    "intro": "DP بتستفيد من subproblems متكررة وoptimal substructure. بدل حل نفس المسألة تاني، خزّن state واضحة. لازم تعرف معنى dp[i] والـbase cases والانتقالات، مش تحفظ loop من غير proof.",
    "how": "في minimum coins، dp[a] أقل عدد coins لتكوين amount a، وdp[0]=0. لكل coin صالحة جرّب dp[a-coin]+1 وخد الأصغر. Greedy أكبر coin مش صحيح لأي denominations؛ [1,3,4] مع 6 مثال واضح.",
    "when": "مناسبة لما القرار الأمثل يعتمد على حالات أصغر محددة. قيّد amount عشان O(amount×coinCount) وO(amount) memory؛ الحجم العددي ممكن يبقى ضخم رغم إن input representation قصيرة.",
    "code": "$inf = $amount + 1;\n$dp = array_fill(0, $amount + 1, $inf);\n$dp[0] = 0;\nfor ($a = 1; $a <= $amount; $a++) {\n    foreach ($positiveCoins as $coin) {\n        if ($coin <= $a) $dp[$a] = min($dp[$a], $dp[$a - $coin] + 1);\n    }\n}\nreturn $dp[$amount] === $inf ? -1 : $dp[$amount];",
    "walkthrough": [
      "Positive coins بتضمن الانتقال لحالة amount أصغر، وinfinity بتميّز unreachable من zero coins.",
      "الـcode مفترض input validated وbounded؛ zero/negative coins أو amount ضخم خارج contract."
    ],
    "trap": "Greedy failure مش دليل إن كل مشكلة محتاجة DP؛ ابدأ بتعريف state وشروط correctness.",
    "check": "إيه الفرق بين memoization وbottom-up، وإزاي تختار base cases تمنع false solutions؟"
  },
  {
    "id": "strategy-adapter",
    "title": "Strategy، Adapter وFactory",
    "group": "Design Patterns",
    "intro": "Strategy بتفصل algorithm قابلة للتبديل، Adapter بيترجم API خارجي لـcontract محلي، وFactory بتحدد بناء/اختيار object. ممكن تستخدمهم مع بعض، لكن كل واحد بيجاوب سؤال مختلف في التصميم.",
    "how": "في shipping، pricing strategy بتختار طريقة الحساب. Provider adapter بيحوّل request/result بين شركتك والـvendor. Factory/resolver بياخد identifier مسموح ويرجع implementation، بدل new على class name جاية من client.",
    "when": "استخدم patterns لما فيه variation أو boundary فعلية. شرطين ثابتين بسيطين مش لازم يتحولوا لمجموعة classes؛ قِس قابلية الفهم والتعديل والاختبار.",
    "code": "interface ShippingQuote { public function quote(Parcel $parcel): Money; }\nfinal class CourierAdapter implements ShippingQuote {\n    public function __construct(private CourierClient $client) {}\n    public function quote(Parcel $parcel): Money {\n        $reply = $this->client->price($this->mapParcel($parcel));\n        return $this->mapMoney($reply);\n    }\n    // Mapping methods omitted; errors must also map to application semantics.\n}",
    "walkthrough": [
      "Adapter بيمنع تسريب vendor payload لباقي التطبيق، لكن لازم يحدد error/timeout semantics كمان.",
      "Resolver تفضل allowlist واضحة للـproviders بدل user-controlled arbitrary instantiation."
    ],
    "trap": "Pattern name مش بديل عن contract سليمة؛ Repository wrapper يكرر Eloquent حرفيًا ممكن يزود indirection بس.",
    "check": "إزاي تشرح الفرق بين Strategy بتغيّر algorithm وFactory بتختار object؟"
  },
  {
    "id": "observer-decorator",
    "title": "Observer، Decorator وSide-effect boundaries",
    "group": "Design Patterns",
    "intro": "Observer/events بيفصلوا ردود الأفعال على حدث، وDecorator بيلف service بنفس contract عشان يضيف behavior قبل وبعد delegation. الفرق إن الأول بيربط fact بمستمعين، والثاني بيحافظ على call path مباشرة عبر wrapper.",
    "how": "Notification listener ممكن تشتغل بعد OrderPlaced؛ metrics decorator حوالين pricing service ممكن يقيس latency ويرجع نفس النتيجة. ترتيب wrappers مؤثر: metrics خارج cache تقيس hits، وداخلها تقيس underlying calculation بس.",
    "when": "مناسب للـcross-cutting behavior أو side effects الواضحة. خلي errors والـreturn contract متوافقة، وحدد transaction/delivery guarantees بدل افتراض إن الـpattern بتوفرها تلقائيًا.",
    "code": "final class MeasuredPrice implements PriceCalculator {\n    public function __construct(private PriceCalculator $inner, private Metrics $metrics) {}\n    public function calculate(Cart $cart): Money {\n        $start = microtime(true);\n        try { return $this->inner->calculate($cart); }\n        finally { $this->metrics->timing('price', microtime(true) - $start); }\n    }\n}",
    "walkthrough": [
      "Decorator بتdelegates لنفس contract، وfinally بتسجل الزمن حتى عند فشل الحساب؛ metrics sink هنا لازم يبقى safe/non-throwing حسب التصميم.",
      "Cached decorator تحتاج key dimensions وinvalidation؛ pattern مش حل تلقائي لـcache correctness."
    ],
    "trap": "Observer per-model events مش بتتطبق بنفس الشكل على bulk update، وafterCommit مش durable delivery كاملة.",
    "check": "إيه الفرق في القياس لو حطيت metrics wrapper قبل أو بعد cache wrapper؟"
  },
  {
    "id": "process-lifetimes",
    "title": "Process lifetimes، OPcache وLong-lived state",
    "group": "PHP",
    "intro": "Runtime model بيحدد إيه اللي يعيش بين requests: PHP-FPM بيدير workers للـrequest execution، وOPcache بتخزن compiled bytecode، وqueue/long-lived HTTP workers بتحتفظ بـapplication state أطول. مشاركة state غلط ممكن تبقى data leak.",
    "how": "اختيار singleton/scoped bindings، static caches، والـrequest objects لازم يتراجع على عمر process الحقيقي. بعد release، worker ممكن يفضل بكود قديم لحد graceful restart؛ OPcache invalidation مش restart لكل consumer.",
    "when": "مهم مع Octane والـqueues ومع أي background daemon. خلي current tenant/user explicit أو scoped بشكل مضمون، واختبر requests متتالية لمستخدمين مختلفين على نفس worker.",
    "code": "// Bad process-wide mutable state:\n// static $currentTenant = $request->tenant;\n// Prefer explicit scope:\n$action->run(tenant: $trustedTenant, input: $validatedInput);\n// Deployment: gracefully reload/restart long-lived workers,\n// then verify release ID, errors and queue lag.",
    "walkthrough": [
      "عمر tenant context محتاج يطابق العملية، مش عمر process اللي بتخدم عمليات كتير.",
      "حتى لو الـobject بيستخدم DI، lifetime غلط ممكن يخلّي dependencies القديمة أو الحساسة تعيش أكتر من المطلوب."
    ],
    "trap": "OPcache مش query cache ولا shared session store، وrestart web servers مش بالضرورة restart queue workers.",
    "check": "إزاي تختبر state leakage بين request A وrequest B من غير افتراض process جديدة؟"
  }
];

concepts.push(...engineeringConcepts);

concepts.push(...domainConcepts);
