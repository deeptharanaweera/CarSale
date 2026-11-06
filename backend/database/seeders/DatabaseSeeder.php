<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\CarModel;
use App\Models\CarModel3d;
use App\Models\Enquiry;
use App\Models\Feature;
use App\Models\Kiosk;
use App\Models\KioskLead;
use App\Models\KioskSession;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\Showroom;
use App\Models\ShowroomFloor;
use App\Models\ShowroomSlot;
use App\Models\TestDrive;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Showrooms
        $nycShowroom = Showroom::create([
            'name' => 'Manhattan Flagship Showroom',
            'code' => 'NYC-01',
            'address' => '540 W 55th St, Hell\'s Kitchen',
            'city' => 'New York, NY',
            'lat' => 40.7684,
            'lng' => -73.9918,
            'phone' => '+1 (212) 555-0199',
            'opening_hours' => 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
            'image' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        ]);

        $laShowroom = Showroom::create([
            'name' => 'Los Angeles Beverly Pavilion',
            'code' => 'LA-01',
            'address' => '9400 Wilshire Blvd',
            'city' => 'Beverly Hills, CA',
            'lat' => 34.0664,
            'lng' => -118.4004,
            'phone' => '+1 (310) 555-0144',
            'opening_hours' => 'Mon - Sat: 10:00 AM - 7:00 PM | Sun: 11:00 AM - 5:00 PM',
            'image' => 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        ]);

        $miaShowroom = Showroom::create([
            'name' => 'Miami Grand Bay Gallery',
            'code' => 'MIA-01',
            'address' => '1100 Biscayne Blvd',
            'city' => 'Miami, FL',
            'lat' => 25.7854,
            'lng' => -80.1901,
            'phone' => '+1 (305) 555-0188',
            'opening_hours' => 'Mon - Sat: 9:30 AM - 7:30 PM | Sun: 11:00 AM - 5:00 PM',
            'image' => 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
        ]);

        // 2. Floors & Slots for NYC
        $nycFloor1 = ShowroomFloor::create([
            'showroom_id' => $nycShowroom->id,
            'name' => 'Ground Level - Supercars & EVs',
            'level' => 1,
            'model_url' => '/models/showroom_floor1.glb',
            'navmesh_url' => '/models/showroom_navmesh1.json',
            'scale' => 1.0,
        ]);

        $nycFloor2 = ShowroomFloor::create([
            'showroom_id' => $nycShowroom->id,
            'name' => 'Upper Level - Luxury & Executive',
            'level' => 2,
            'model_url' => '/models/showroom_floor2.glb',
            'scale' => 1.0,
        ]);

        $laFloor1 = ShowroomFloor::create([
            'showroom_id' => $laShowroom->id,
            'name' => 'Main Showcase Atrium',
            'level' => 1,
            'scale' => 1.0,
        ]);

        // NYC Slots
        $slots = [
            ['label' => 'Center Stage VIP', 'pos_x' => 0.0, 'pos_y' => 0.0, 'pos_z' => 0.0, 'rotation_y' => 0.0, 'type' => 'indoor'],
            ['label' => 'North Bay A1', 'pos_x' => -6.5, 'pos_y' => 0.0, 'pos_z' => -3.5, 'rotation_y' => 0.45, 'type' => 'indoor'],
            ['label' => 'North Bay A2', 'pos_x' => -6.5, 'pos_y' => 0.0, 'pos_z' => 3.5, 'rotation_y' => -0.45, 'type' => 'indoor'],
            ['label' => 'South Bay B1', 'pos_x' => 6.5, 'pos_y' => 0.0, 'pos_z' => -3.5, 'rotation_y' => -0.45, 'type' => 'indoor'],
            ['label' => 'South Bay B2', 'pos_x' => 6.5, 'pos_y' => 0.0, 'pos_z' => 3.5, 'rotation_y' => 0.45, 'type' => 'indoor'],
            ['label' => 'EV Fast Lane 01', 'pos_x' => 0.0, 'pos_y' => 0.0, 'pos_z' => -7.5, 'rotation_y' => 1.57, 'type' => 'indoor'],
            ['label' => 'Curbside Delivery 01', 'pos_x' => -10.0, 'pos_y' => 0.0, 'pos_z' => 10.0, 'rotation_y' => 0.0, 'type' => 'outdoor'],
        ];

        $nycCreatedSlots = [];
        foreach ($slots as $slotData) {
            $nycCreatedSlots[] = ShowroomSlot::create(array_merge($slotData, ['floor_id' => $nycFloor1->id]));
        }

        // LA Slot
        $laSlot1 = ShowroomSlot::create([
            'floor_id' => $laFloor1->id,
            'label' => 'Beverly Atrium Slot 1',
            'pos_x' => 0.0,
            'pos_y' => 0.0,
            'pos_z' => 0.0,
            'rotation_y' => 0.0,
            'type' => 'indoor',
        ]);

        // 3. Kiosks
        $kiosk1 = Kiosk::create([
            'showroom_id' => $nycShowroom->id,
            'floor_id' => $nycFloor1->id,
            'name' => 'NYC Entrance Kiosk #1',
            'token' => 'KIOSK_TOKEN_NYC_01',
            'pos_x' => 0.0,
            'pos_y' => 0.0,
            'pos_z' => 8.5, // 8.5m south of center
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        $kiosk2 = Kiosk::create([
            'showroom_id' => $nycShowroom->id,
            'floor_id' => $nycFloor1->id,
            'name' => 'NYC West Lounge Kiosk #2',
            'token' => 'KIOSK_TOKEN_NYC_02',
            'pos_x' => -8.0,
            'pos_y' => 0.0,
            'pos_z' => 0.0,
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        $kiosk3 = Kiosk::create([
            'showroom_id' => $laShowroom->id,
            'floor_id' => $laFloor1->id,
            'name' => 'Beverly Main Kiosk',
            'token' => 'KIOSK_TOKEN_LA_01',
            'pos_x' => 0.0,
            'pos_y' => 0.0,
            'pos_z' => 7.0,
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        // 4. Users
        $admin = User::create([
            'name' => 'Alexander Vance (Super Admin)',
            'email' => 'admin@carsale.com',
            'phone' => '+1 (555) 010-0001',
            'role' => 'super_admin',
            'password' => Hash::make('password'),
        ]);

        $manager = User::create([
            'name' => 'Marcus Sterling (Showroom Director)',
            'email' => 'manager.downtown@carsale.com',
            'phone' => '+1 (555) 010-0002',
            'role' => 'manager',
            'showroom_id' => $nycShowroom->id,
            'password' => Hash::make('password'),
        ]);

        $staff = User::create([
            'name' => 'Elena Rostova (Senior Sales)',
            'email' => 'sales.elena@carsale.com',
            'phone' => '+1 (555) 010-0003',
            'role' => 'sales_staff',
            'showroom_id' => $nycShowroom->id,
            'password' => Hash::make('password'),
        ]);

        $customer = User::create([
            'name' => 'David Miller',
            'email' => 'customer@example.com',
            'phone' => '+1 (555) 010-0004',
            'role' => 'customer',
            'password' => Hash::make('password'),
        ]);

        // 5. Brands & Models
        $brandsData = [
            ['name' => 'Lamborghini', 'slug' => 'lamborghini', 'logo' => 'https://cdn.worldvectorlogo.com/logos/lamborghini.svg'],
            ['name' => 'Porsche', 'slug' => 'porsche', 'logo' => 'https://cdn.worldvectorlogo.com/logos/porsche-6.svg'],
            ['name' => 'BMW', 'slug' => 'bmw', 'logo' => 'https://cdn.worldvectorlogo.com/logos/bmw.svg'],
            ['name' => 'Mercedes-Benz', 'slug' => 'mercedes-benz', 'logo' => 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg'],
            ['name' => 'Audi', 'slug' => 'audi', 'logo' => 'https://cdn.worldvectorlogo.com/logos/audi-13.svg'],
            ['name' => 'Tesla', 'slug' => 'tesla', 'logo' => 'https://cdn.worldvectorlogo.com/logos/tesla-9.svg'],
            ['name' => 'Ferrari', 'slug' => 'ferrari', 'logo' => 'https://cdn.worldvectorlogo.com/logos/ferrari-ges.svg'],
        ];

        $brands = [];
        foreach ($brandsData as $b) {
            $brands[$b['slug']] = Brand::create($b);
        }

        $lamboCountach = CarModel::create(['brand_id' => $brands['lamborghini']->id, 'name' => 'Countach LPI 800-4', 'body_type' => 'Coupe']);
        $porsche911 = CarModel::create(['brand_id' => $brands['porsche']->id, 'name' => '911 GT3 RS', 'body_type' => 'Coupe']);
        $porscheTaycan = CarModel::create(['brand_id' => $brands['porsche']->id, 'name' => 'Taycan Turbo S', 'body_type' => 'Electric']);
        $bmwM4 = CarModel::create(['brand_id' => $brands['bmw']->id, 'name' => 'M4 Competition xDrive', 'body_type' => 'Coupe']);
        $bmwi7 = CarModel::create(['brand_id' => $brands['bmw']->id, 'name' => 'i7 xDrive60 Excellence', 'body_type' => 'Sedan']);
        $mercAMG = CarModel::create(['brand_id' => $brands['mercedes-benz']->id, 'name' => 'AMG GT 63 S E-Performance', 'body_type' => 'Coupe']);
        $mercG63 = CarModel::create(['brand_id' => $brands['mercedes-benz']->id, 'name' => 'G 63 AMG Stronger Than Diamonds', 'body_type' => 'SUV']);
        $audiRSetron = CarModel::create(['brand_id' => $brands['audi']->id, 'name' => 'RS e-tron GT', 'body_type' => 'Electric']);
        $teslaModelS = CarModel::create(['brand_id' => $brands['tesla']->id, 'name' => 'Model S Plaid Track Edition', 'body_type' => 'Electric']);
        $ferrari296 = CarModel::create(['brand_id' => $brands['ferrari']->id, 'name' => '296 GTB Assetto Fiorano', 'body_type' => 'Coupe']);

        // 6. Features
        $featureItems = [
            ['name' => 'Carbon Ceramic Brakes (PCCB)', 'category' => 'Performance', 'icon' => 'Disc'],
            ['name' => 'Sport Chrono Package', 'category' => 'Performance', 'icon' => 'Timer'],
            ['name' => 'Head-Up Display with AR', 'category' => 'Technology', 'icon' => 'Eye'],
            ['name' => 'Burmester High-End 3D Surround', 'category' => 'Interior', 'icon' => 'Volume2'],
            ['name' => 'Panoramic Electric Sunroof', 'category' => 'Interior', 'icon' => 'Sun'],
            ['name' => 'Adaptive 18-Way Sport Seats Plus', 'category' => 'Interior', 'icon' => 'Armchair'],
            ['name' => 'Apple CarPlay & Android Auto Wireless', 'category' => 'Technology', 'icon' => 'Smartphone'],
            ['name' => 'Active Rear-Axle Steering', 'category' => 'Performance', 'icon' => 'Compass'],
            ['name' => '360° Surround View with ParkAssist', 'category' => 'Safety', 'icon' => 'Camera'],
            ['name' => 'Lane Change & Traffic Jam Assist', 'category' => 'Safety', 'icon' => 'ShieldCheck'],
        ];

        $featureModels = [];
        foreach ($featureItems as $item) {
            $featureModels[] = Feature::create($item);
        }
        $featureIds = collect($featureModels)->pluck('id');

        // 7. Cars
        $carsData = [
            [
                'model_id' => $lamboCountach->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => $nycCreatedSlots[0]->id, // Center Stage VIP
                'title' => '2022 Lamborghini Countach LPI 800-4',
                'slug' => '2022-lamborghini-countach-lpi-800-4',
                'year' => 2022,
                'price' => 2640000.00,
                'mileage' => 180,
                'fuel' => 'Mild Hybrid V12',
                'transmission' => '7-Speed ISR Dual-Sync',
                'color' => 'Impact White',
                'vin' => 'ZHWUR4ZF7NLA01804',
                'condition' => 'New',
                'description' => 'Limited production hypercar celebrating 50 years of the legendary Countach wedge shape. Powered by a 6.5L naturally aspirated V12 paired with a 48V electric motor producing 803 hp. 0-100 km/h in 2.8s.',
                'status' => 'available',
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/2021_lamborghini_countach_lpi_800-4.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Impact White', 'hex' => '#F0F0F2', 'roughness' => 0.15, 'metalness' => 0.8],
                        ['name' => 'Giallo Countach Yellow', 'hex' => '#FFC800', 'roughness' => 0.2, 'metalness' => 0.6],
                        ['name' => 'Rosso Siviglia Red', 'hex' => '#D91E18', 'roughness' => 0.15, 'metalness' => 0.7],
                        ['name' => 'Verde Ermes Green', 'hex' => '#1DB954', 'roughness' => 0.2, 'metalness' => 0.75],
                        ['name' => 'Nero Noctis Black', 'hex' => '#111215', 'roughness' => 0.1, 'metalness' => 0.9],
                    ],
                    'wheels' => [
                        ['name' => '20/21" Countach Retro Phone-Dial Forged', 'code' => 'W01', 'price' => 0],
                        ['name' => '20/21" Satin Carbon Matte Magnesium', 'code' => 'W02', 'price' => 18000],
                        ['name' => '20/21" Oro Elios Heritage Gold', 'code' => 'W03', 'price' => 6500],
                    ],
                    'interior' => [
                        ['name' => 'Nero Ade & Rosso Alala Bicolor Leather', 'code' => 'INT-01'],
                        ['name' => 'Bianco Leda Monocolor Smooth Leather', 'code' => 'INT-02'],
                    ]
                ],
                'interior_camera' => [
                    'position' => [0, 0.9, 0.2],
                    'target' => [0, 0.8, -0.5],
                ]
            ],
            [
                'model_id' => $bmwM4->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => $nycCreatedSlots[1]->id, // North Bay A1
                'title' => '2024 BMW M4 Competition xDrive Coupe',
                'slug' => '2024-bmw-m4-competition-xdrive',
                'year' => 2024,
                'price' => 96400.00,
                'mileage' => 1200,
                'fuel' => 'Petrol',
                'transmission' => '8-Speed M Steptronic',
                'color' => 'Isle of Man Green',
                'vin' => 'WBA43AZ06RCP88102',
                'condition' => 'Certified Pre-Owned',
                'description' => 'M TwinPower Turbo 3.0L inline-6 generating 503 horsepower paired with intelligent M xDrive all-wheel drive. Includes M Carbon Exterior Package, M Driver\'s Package, and Merino Kyalami Orange interior.',
                'status' => 'available',
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/bmw_m4.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Isle of Man Green', 'hex' => '#0F4D3C', 'roughness' => 0.2, 'metalness' => 0.7],
                        ['name' => 'Frozen Brilliant White', 'hex' => '#EAEAEA', 'roughness' => 0.45, 'metalness' => 0.3],
                        ['name' => 'Tanzanite Blue II', 'hex' => '#142544', 'roughness' => 0.2, 'metalness' => 0.8],
                        ['name' => 'Sao Paulo Yellow', 'hex' => '#C4D600', 'roughness' => 0.2, 'metalness' => 0.5],
                    ],
                    'wheels' => [
                        ['name' => '19/20" M Double-spoke Style 826M Black', 'code' => 'W826', 'price' => 0],
                        ['name' => '19/20" M Forged Style 825M Bicolor', 'code' => 'W825', 'price' => 1800],
                    ],
                ],
                'interior_camera' => [
                    'position' => [0, 0.85, 0.1],
                    'target' => [0, 0.75, -0.6],
                ],
            ],
            [
                'model_id' => $mercAMG->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => $nycCreatedSlots[2]->id, // North Bay A2
                'title' => '2024 Mercedes-AMG GT 63 S E-Performance',
                'slug' => '2024-mercedes-amg-gt-63-s-e-performance',
                'year' => 2024,
                'price' => 189000.00,
                'mileage' => 800,
                'fuel' => 'Hybrid',
                'transmission' => 'AMG SPEEDSHIFT MCT 9G',
                'color' => 'Solarbeam Yellow',
                'vin' => 'W1K4X8HB1RN490012',
                'condition' => 'New',
                'description' => 'F1-derived E-Performance hybrid system pairing a 4.0L BiTurbo V8 with a high-performance rear axle electric drive unit. Combined 831 horsepower and jaw-dropping 1,033 lb-ft of torque.',
                'status' => 'available',
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/amg_gt.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Solarbeam Yellow', 'hex' => '#FFC800', 'roughness' => 0.2, 'metalness' => 0.65],
                        ['name' => 'Obsidian Black Metallic', 'hex' => '#141414', 'roughness' => 0.15, 'metalness' => 0.85],
                        ['name' => 'MANUFAKTUR Selenite Grey Magno', 'hex' => '#5C5F62', 'roughness' => 0.5, 'metalness' => 0.4],
                    ],
                    'wheels' => [
                        ['name' => '21" AMG Cross-Spoke Forged Matte Black', 'code' => 'AMGW01', 'price' => 0],
                        ['name' => '21" AMG Forged Twin-5-Spoke Silver', 'code' => 'AMGW02', 'price' => 2200],
                    ],
                ],
                'interior_camera' => [
                    'position' => [0, 0.9, 0.15],
                    'target' => [0, 0.8, -0.6],
                ],
            ],
            [
                'model_id' => $audiRSetron->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => $nycCreatedSlots[3]->id, // South Bay B1
                'title' => '2024 Audi RS e-tron GT Carbon Black Edition',
                'slug' => '2024-audi-rs-e-tron-gt-carbon-black',
                'year' => 2024,
                'price' => 152000.00,
                'mileage' => 2100,
                'fuel' => 'Electric',
                'transmission' => '2-Speed Automatic Rear / 1-Speed Front',
                'color' => 'Kemora Gray Metallic',
                'vin' => 'WAU3GBFP9RA019284',
                'condition' => 'Certified Pre-Owned',
                'description' => 'Electric grand touring perfection. 637 horsepower in boost mode launching from 0-60 mph in 2.9 seconds. 800-volt high-voltage architecture enabling 5% to 80% charging in just 22.5 minutes.',
                'status' => 'available',
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/audi_etron.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Kemora Gray Metallic', 'hex' => '#4D5860', 'roughness' => 0.25, 'metalness' => 0.75],
                        ['name' => 'Mythos Black Metallic', 'hex' => '#121213', 'roughness' => 0.15, 'metalness' => 0.8],
                        ['name' => 'Tango Red Metallic', 'hex' => '#9B1B22', 'roughness' => 0.2, 'metalness' => 0.7],
                    ],
                    'wheels' => [
                        ['name' => '21" 5-Double-Spoke Concave Aero Design', 'code' => 'AU01', 'price' => 0],
                    ],
                ],
                'interior_camera' => [
                    'position' => [0, 0.85, 0.1],
                    'target' => [0, 0.78, -0.55],
                ],
            ],
            [
                'model_id' => $teslaModelS->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => $nycCreatedSlots[4]->id, // South Bay B2
                'title' => '2024 Tesla Model S Plaid (Track Pack)',
                'slug' => '2024-tesla-model-s-plaid-track-pack',
                'year' => 2024,
                'price' => 109990.00,
                'mileage' => 3400,
                'fuel' => 'Electric',
                'transmission' => 'Single-Speed Fixed Gear',
                'color' => 'Ultra Red',
                'vin' => '5YJSA1E67PF829104',
                'condition' => 'Used',
                'description' => 'Tri-motor all-wheel drive generating 1,020 horsepower. 0-60 in 1.99s, top speed 200 mph with Carbon Ceramic Track Pack brakes, Zero-G wheels, and Goodyear Supercar 3R tires.',
                'status' => 'available',
                'is_featured' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/tesla_plaid.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Ultra Red', 'hex' => '#B81324', 'roughness' => 0.2, 'metalness' => 0.7],
                        ['name' => 'Pearl White Multi-Coat', 'hex' => '#F4F4F6', 'roughness' => 0.25, 'metalness' => 0.6],
                        ['name' => 'Solid Black', 'hex' => '#0A0A0B', 'roughness' => 0.1, 'metalness' => 0.9],
                    ],
                    'wheels' => [
                        ['name' => '20" Zero-G Track Pack Wheels', 'code' => 'TS01', 'price' => 0],
                        ['name' => '21" Arachnid Wheels', 'code' => 'TS02', 'price' => 4500],
                    ],
                ],
            ],
            [
                'model_id' => $ferrari296->id,
                'showroom_id' => $laShowroom->id,
                'slot_id' => $laSlot1->id,
                'title' => '2024 Ferrari 296 GTB Assetto Fiorano',
                'slug' => '2024-ferrari-296-gtb-assetto-fiorano',
                'year' => 2024,
                'price' => 389000.00,
                'mileage' => 190,
                'fuel' => 'Hybrid',
                'transmission' => '8-Speed Dual-Clutch F1',
                'color' => 'Rosso Corsa',
                'vin' => 'ZFF98NMA6P0293819',
                'condition' => 'New',
                'description' => 'The revolution of the 120-degree turbo V6 coupled with an electric motor for an astounding 819 cv. Assetto Fiorano lightweight package includes Multimatic GT-derived shock absorbers and carbon aerodynamic appendages.',
                'status' => 'available',
                'is_featured' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
                ],
                'glb_url' => '/models/ferrari_296.glb',
                'variants' => [
                    'colors' => [
                        ['name' => 'Rosso Corsa', 'hex' => '#C40D1E', 'roughness' => 0.15, 'metalness' => 0.75],
                        ['name' => 'Giallo Modena', 'hex' => '#FFDC00', 'roughness' => 0.15, 'metalness' => 0.7],
                        ['name' => 'Grigio Silverstone', 'hex' => '#3E4146', 'roughness' => 0.25, 'metalness' => 0.85],
                    ],
                ],
            ],
            [
                'model_id' => $mercG63->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => null, // In storage / transit
                'title' => '2024 Mercedes-AMG G 63 "Stronger Than Diamonds"',
                'slug' => '2024-mercedes-amg-g63-diamonds',
                'year' => 2024,
                'price' => 245000.00,
                'mileage' => 50,
                'fuel' => 'Petrol',
                'transmission' => 'AMG SPEEDSHIFT TCT 9G',
                'color' => 'MANUFAKTUR Rosewood Grey Magno',
                'vin' => 'W1NYC77E0RX984102',
                'condition' => 'New',
                'description' => 'Exclusive limited edition with 25-carat diamonds embedded into the stainless steel door locking pins. Handcrafted 4.0L V8 Biturbo producing 577 hp with side-pipe sports exhaust.',
                'status' => 'reserved',
                'is_featured' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'model_id' => $bmwi7->id,
                'showroom_id' => $nycShowroom->id,
                'slot_id' => null,
                'title' => '2024 BMW i7 xDrive60 Excellence',
                'slug' => '2024-bmw-i7-xdrive60-excellence',
                'year' => 2024,
                'price' => 124200.00,
                'mileage' => 8400,
                'fuel' => 'Electric',
                'transmission' => 'Automatic',
                'color' => 'Black Sapphire Metallic',
                'vin' => 'WBA23EM07RCP77491',
                'condition' => 'Certified Pre-Owned',
                'description' => 'Flagship luxury sedan with 31.3" 8K BMW Theatre Screen in the rear passenger suite, Bowers & Wilkins Diamond 4D audio, Executive Lounge seating with continuous leg rest.',
                'status' => 'sold',
                'is_featured' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
        ];

        $createdCars = [];
        foreach ($carsData as $cData) {
            $images = $cData['images'] ?? [];
            $glbUrl = $cData['glb_url'] ?? null;
            $variants = $cData['variants'] ?? null;
            $interiorCamera = $cData['interior_camera'] ?? null;
            unset($cData['images'], $cData['glb_url'], $cData['variants'], $cData['interior_camera']);

            $cData['location_updated_at'] = now();
            $car = Car::create($cData);
            $car->features()->sync($featureIds->random(min(6, count($featureIds))));

            // Images
            foreach ($images as $index => $imgUrl) {
                CarImage::create([
                    'car_id' => $car->id,
                    'url' => $imgUrl,
                    'type' => $index === 0 ? 'gallery' : ($index === 1 ? '360' : 'interior'),
                    'sort_order' => $index,
                ]);
            }

            // 3D Model
            if ($glbUrl) {
                CarModel3d::create([
                    'car_id' => $car->id,
                    'glb_url' => $glbUrl,
                    'variants' => $variants,
                    'interior_camera' => $interiorCamera,
                ]);
            }

            $createdCars[] = $car;
        }

        // 8. Enquiries, Test Drives, Reservations
        Enquiry::create([
            'car_id' => $createdCars[0]->id,
            'user_id' => $customer->id,
            'name' => 'David Miller',
            'email' => 'customer@example.com',
            'phone' => '+1 (555) 010-0004',
            'message' => 'Interested in the Weissach Package specs and ceramic brake warranty terms. Can I schedule a private inspection at Manhattan?',
            'status' => 'new',
        ]);

        Enquiry::create([
            'car_id' => $createdCars[1]->id,
            'user_id' => null,
            'name' => 'Sophia Lauren',
            'email' => 'sophia.l@business.com',
            'phone' => '+1 (212) 555-8822',
            'message' => 'Is trade-in available for my 2021 M2 CS towards this M4 Competition?',
            'status' => 'contacted',
        ]);

        TestDrive::create([
            'car_id' => $createdCars[0]->id,
            'user_id' => $customer->id,
            'name' => 'David Miller',
            'phone' => '+1 (555) 010-0004',
            'email' => 'customer@example.com',
            'date_time' => now()->addDays(2)->setHour(14)->setMinute(0),
            'status' => 'confirmed',
        ]);

        TestDrive::create([
            'car_id' => $createdCars[2]->id,
            'user_id' => null,
            'name' => 'Jonathan Vance',
            'phone' => '+1 (917) 555-3311',
            'email' => 'jvance@nycapitol.org',
            'date_time' => now()->addDays(3)->setHour(11)->setMinute(30),
            'status' => 'pending',
        ]);

        Reservation::create([
            'car_id' => $createdCars[6]->id, // G63
            'user_id' => null,
            'name' => 'Maximilian Cross',
            'phone' => '+1 (212) 555-7799',
            'email' => 'm.cross@crossholdings.com',
            'amount' => 5000.00,
            'status' => 'paid',
        ]);

        Sale::create([
            'car_id' => $createdCars[7]->id, // i7
            'customer' => 'Arthur Pendelton',
            'sold_price' => 121500.00,
            'sold_at' => now()->subDays(4),
        ]);

        // 9. Kiosk Sessions & Leads
        $kioskSession = KioskSession::create([
            'kiosk_id' => $kiosk1->id,
            'started_at' => now()->subMinutes(35),
            'ended_at' => now()->subMinutes(18),
            'cars_viewed' => [$createdCars[0]->id, $createdCars[1]->id, $createdCars[2]->id],
        ]);

        KioskLead::create([
            'kiosk_id' => $kiosk1->id,
            'car_id' => $createdCars[0]->id,
            'name' => 'Robert Thorne',
            'phone' => '+1 (917) 555-4019',
            'action' => 'call_staff',
        ]);

        KioskLead::create([
            'kiosk_id' => $kiosk1->id,
            'car_id' => $createdCars[1]->id,
            'name' => 'Emily Watson',
            'phone' => '+1 (646) 555-9012',
            'action' => 'test_drive',
        ]);

        // 10. Activity Logs
        ActivityLog::log('slot_assigned', 'Car #1 assigned to slot Center Stage VIP', ['car_id' => 1, 'slot_id' => 1], $admin->id);
        ActivityLog::log('status_changed', 'Car #7 status updated to reserved', ['car_id' => 7, 'status' => 'reserved'], $manager->id);
        ActivityLog::log('kiosk_lead_created', 'New kiosk lead from Manhattan Entrance Kiosk', ['kiosk_id' => 1, 'action' => 'call_staff']);
    }
}
