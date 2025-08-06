import {
    Baby,
    Car,
    ChefHat,
    Dog,
    Leaf,
    PaintBucket,
    ShoppingCart,
    Sparkles,
    Shirt,
    Wrench,
    HeartHandshake,
    Accessibility,
} from "lucide-react";
import * as React from "react";

type Service = {
    id: string;
    name: string;
    icon: React.ElementType;
};

export const services: Service[] = [
    {
        id: "general_cleaning",
        name: "General Cleaning",
        icon: PaintBucket,
    },
    {
        id: "deep_cleaning",
        name: "Deep Cleaning",
        icon: Sparkles,
    },
    {
        id: "laundry",
        name: "Laundry & Ironing",
        icon: Shirt,
    },
    {
        id: "child_care",
        name: "Child Care",
        icon: Baby,
    },
    {
        id: "elderly_care",
        name: "Elderly Care",
        icon: Accessibility,
    },
    {
        id: "personal_wellness_support",
        name: "Personal Wellness Support",
        icon: HeartHandshake,
    },
    {
        id: "pet_care",
        name: "Pet Care",
        icon: Dog,
    },
    {
        id: "chef_assistant",
        name: "Chef / Cooking",
        icon: ChefHat,
    },
    {
        id: "personal_shopper",
        name: "Personal Shopper",
        icon: ShoppingCart,
    },
    {
        id: "errands",
        name: "Running Errands",
        icon: Car,
    },
    {
        id: "gardening",
        name: "Gardening",
        icon: Leaf,
    },
    {
        id: "handyman",
        name: "Handyman",
        icon: Wrench,
    },
];

export const serviceOptions = services.map(({ id, name }) => ({
    id,
    label: name,
}));

// Usage example for rendering icon:
// <service.icon className="h-full w-full" />
