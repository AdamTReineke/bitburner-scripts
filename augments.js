var factions = {
    s12: "Sector-12",
    nitesec: "NiteSec",
    blackhand: "The Black Hand",
    cybersec: "CyberSec",
};

var THEMES = {
    starter: "starter",
    hack: "hack",
    DA: "DA", // dex/agility
    SD: "SD", // str/def
    cha: "cha",
    all: "all",
}

/**
 * @type {Array<{name: string, factions: Array<string>, theme: string, requires?: string}>}
 */
var augments = [
    {
        name: "CashRoot Starter Kit",
        factions: [factions.s12],
        theme: THEMES.starter,
    },
    {
        name: "Neuralstimulator",
        factions: [factions.s12],
        theme: THEMES.hack,
    },
    {
        name: "Speech Processor Implant",
        factions: [factions.s12],
        theme: THEMES.cha
    },
    {
        name: "Wired Reflexes",
        factions: [factions.s12],
        theme: THEMES.DA,
    },
    {
        name: "Augmented Targeting I",
        factions: [factions.s12],
        theme: THEMES.DA
    },
    {
        name: "Augmented Targeting II",
        requires: "Augmented Targeting I",
        factions: [factions.s12],
        theme: THEMES.DA
    },
    {
        name: "BitWire",
        factions: [factions.cybersec, factions.nitesec],
        theme: THEMES.hack
    },
    {
        name: "Synaptic Enhancement Implant",
        factions: [factions.cybersec],
        theme: THEMES.hack
    },
    {
        name: "Cranial Signal Processors - Gen I",
        factions: [factions.cybersec],
        theme: THEMES.hack
    },
    {
        name: "Cranial Signal Processors - Gen II",
        requires: "Cranial Signal Processors - Gen I",
        factions: [factions.nitesec],
        theme: THEMES.hack
    },
    {
        name: "Cranial Signal Processors - Gen III",
        requires: "Cranial Signal Processors - Gen II",
        factions: [factions.nitesec],
        theme: THEMES.hack
    },
    {
        name: "Artificial Synaptic Potentiation",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
    {
        name: "Neural-Retention Enhancement",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
    {
        name: "DataJack",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
    {
        name: "Embedded Netburner Module",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
    {
        name: "Neurotrainer II",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
    {
        name: "CRTX42-AA Gene Modification",
        factions: [factions.nitesec],
        theme: THEMES.hack,
    },
]