window.ITSDaksLabs = [
  {
    "id": "ccna-01-branch-guest-wifi-vlan-nat-acl",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "Branch Guest Wi‑Fi Outage: Trunk VLAN Missing + Guest ACL",
    "summary": "Guest VLAN 20 fails DHCP due to trunk issue. After DHCP is fixed, guests must be blocked from Staff VLAN 10.",
    "tags": [
      "VLAN",
      "802.1Q",
      "DHCP",
      "NAT",
      "ACL"
    ],
    "objectives": [
      "Restore DHCP for Guest VLAN20.",
      "Keep Staff VLAN10 stable.",
      "Enforce Guest internet-only access."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Branch Router)",
          "x": 120,
          "y": 60
        },
        {
          "id": "SW1",
          "label": "SW1\n(Access Switch)",
          "x": 120,
          "y": 180
        },
        {
          "id": "ISP",
          "label": "ISP\n(Sim)",
          "x": 320,
          "y": 60
        },
        {
          "id": "PC-STAFF",
          "label": "PC-STAFF\nVLAN10",
          "x": 40,
          "y": 320
        },
        {
          "id": "SRV-FILE",
          "label": "SRV-FILE\n10.10.10.50",
          "x": 200,
          "y": 320
        },
        {
          "id": "PC-GUEST",
          "label": "PC-GUEST\nVLAN20",
          "x": 340,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "SW1",
          "label": "G0/0 ↔ G0/1 trunk"
        },
        {
          "a": "R1",
          "b": "ISP",
          "label": "G0/1 ↔ WAN 203.0.113.0/30"
        },
        {
          "a": "SW1",
          "b": "PC-STAFF",
          "label": "Access VLAN10"
        },
        {
          "a": "SW1",
          "b": "SRV-FILE",
          "label": "Access VLAN10"
        },
        {
          "a": "SW1",
          "b": "PC-GUEST",
          "label": "Access VLAN20"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Guest SSID maps to VLAN20. Staff VLAN10 must keep internal access. Guests must be internet-only.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC-GUEST gets no DHCP lease (169.254.x.x).</li>\n      <li>Staff is working normally.</li>\n      <li>After DHCP, Guest must be blocked from 10.10.10.0/24.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Trunk SW1↔R1 must carry VLAN 10 and 20.</li>\n      <li>R1 provides DHCP pools for VLAN10 and VLAN20.</li>\n      <li>Apply Guest ACL inbound on G0/0.20.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Use show interfaces trunk (SW1) and show ip dhcp binding (R1).</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC-GUEST receives 10.10.20.x.</li>\n      <li>PC-GUEST can ping 8.8.8.8.</li>\n      <li>PC-GUEST cannot ping 10.10.10.50.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "hostname R1\ninterface g0/0\n no shutdown\ninterface g0/0.10\n encapsulation dot1Q 10\n ip address 10.10.10.1 255.255.255.0\n ip nat inside\ninterface g0/0.20\n encapsulation dot1Q 20\n ip address 10.10.20.1 255.255.255.0\n ip nat inside\ninterface g0/1\n ip address 203.0.113.2 255.255.255.252\n ip nat outside\n no shutdown\nip dhcp excluded-address 10.10.10.1 10.10.10.20\nip dhcp excluded-address 10.10.20.1 10.10.20.20\nip dhcp pool STAFF\n network 10.10.10.0 255.255.255.0\n default-router 10.10.10.1\nip dhcp pool GUEST\n network 10.10.20.0 255.255.255.0\n default-router 10.10.20.1\nip access-list extended GUEST-INTERNET-ONLY\n deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255\n permit ip 10.10.20.0 0.0.0.255 any\naccess-list 1 permit 10.10.0.0 0.0.255.255\nip nat inside source list 1 interface g0/1 overload\nip route 0.0.0.0 0.0.0.0 203.0.113.1\nend",
      "SW1 (starting)": "hostname SW1\nvlan 10\nvlan 20\ninterface g0/1\n switchport mode trunk\n switchport trunk allowed vlan 10\nend"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Allow VLAN20 on the trunk, then apply the Guest ACL inbound on the VLAN20 subinterface.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Allow VLAN 20 on trunk (SW1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna01_fix1\">Copy</button>\n  <pre><code id=\"ccna01_fix1\">conf t\ninterface g0/1\n switchport trunk allowed vlan 10,20\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n<h3 style=\"margin:0 0 8px 0;\">2) Apply ACL inbound (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna01_fix2\">Copy</button>\n  <pre><code id=\"ccna01_fix2\">conf t\ninterface g0/0.20\n ip access-group GUEST-INTERNET-ONLY in\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>SW1: show interfaces trunk lists VLAN 10,20.</li>\n  <li>R1: show ip dhcp binding includes 10.10.20.x lease.</li>\n  <li>PC-GUEST ping 8.8.8.8 succeeds; ping 10.10.10.50 fails.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "SW1",
        "PC-STAFF",
        "PC-GUEST"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp binding\n  - show run | sec interface g0/0.20\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp binding",
            "out": "Bindings:\n  10.10.10.10  (STAFF)\n  (no GUEST bindings)"
          },
          {
            "match": "show run | sec interface g0/0.20",
            "out": "interface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 10.10.20.1 255.255.255.0\n ip nat inside"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Port        Mode         Encapsulation  Status        Native vlan\nGi0/1       on           802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nGi0/1       10"
          }
        ],
        "PC-STAFF": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "PC-GUEST": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 169.254.10.20\nGateway     : (none)\nDHCP        : FAILED"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: No DHCP lease / no gateway"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp binding\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp binding",
            "out": "Bindings:\n  10.10.10.10  (STAFF)\n  10.10.20.10  (GUEST)"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Port        Mode         Encapsulation  Status        Native vlan\nGi0/1       on           802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nGi0/1       10,20"
          }
        ],
        "PC-GUEST": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 8.8.8.8\n  - ping 10.10.10.50\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 10.10.20.10\nGateway     : 10.10.20.1"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          },
          {
            "match": "ping 10.10.10.50",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.10.10.50, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Blocked by Guest ACL (expected)"
          }
        ],
        "PC-STAFF": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.10.10.50\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.10.10.50",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.10.10.50, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-02-intervlan-ip-routing-disabled",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 35,
    "title": "Inter‑VLAN Routing Failure: ip routing Disabled on MLS",
    "summary": "SVIs are up but inter‑VLAN traffic fails because routing is disabled on the multilayer switch.",
    "tags": [
      "SVI",
      "Inter-VLAN",
      "ip routing"
    ],
    "objectives": [
      "Confirm SVIs are up.",
      "Identify 'no ip routing'.",
      "Enable routing and verify ping between VLANs."
    ],
    "topology": {
      "nodes": [
        {
          "id": "MLS1",
          "label": "MLS1\n(L3 Switch)",
          "x": 200,
          "y": 140
        },
        {
          "id": "PC10",
          "label": "PC10\nVLAN10",
          "x": 80,
          "y": 320
        },
        {
          "id": "PC20",
          "label": "PC20\nVLAN20",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "MLS1",
          "b": "PC10",
          "label": "Access VLAN10"
        },
        {
          "a": "MLS1",
          "b": "PC20",
          "label": "Access VLAN20"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> MLS1 routes between VLAN10 and VLAN20.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC10 can ping 10.0.10.1.</li>\n      <li>PC20 can ping 10.0.20.1.</li>\n      <li>PC10 cannot ping 10.0.20.10.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Enable L3 routing on MLS1.</li>\n      <li>Do not change VLAN addressing.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">SVIs being up does not guarantee L3 routing is enabled.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC10↔PC20 ping succeeds.</li>\n      <li>show run | i ip routing shows ip routing.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "MLS1 (starting)": "hostname MLS1\nvlan 10\nvlan 20\ninterface vlan10\n ip address 10.0.10.1 255.255.255.0\n no shutdown\ninterface vlan20\n ip address 10.0.20.1 255.255.255.0\n no shutdown\nno ip routing\nend"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Enable ip routing on the multilayer switch.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Enable routing (MLS1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna02_fix1\">Copy</button>\n  <pre><code id=\"ccna02_fix1\">conf t\nip routing\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>MLS1: show run | i ip routing</li>\n  <li>PC10 ping 10.0.20.10 succeeds.</li>\n</ul>",
    "cli": {
      "devices": [
        "MLS1",
        "PC10",
        "PC20"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "MLS1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | i ip routing\n  - show ip route\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | i ip routing",
            "out": "no ip routing"
          },
          {
            "match": "show ip route",
            "out": "% IP routing not enabled"
          }
        ],
        "PC10": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.0.20.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.0.20.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.0.20.10, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Inter‑VLAN routing is disabled on MLS1"
          }
        ],
        "PC20": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.0.10.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.0.10.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.0.10.10, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Inter‑VLAN routing is disabled on MLS1"
          }
        ]
      },
      "fixed": {
        "MLS1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | i ip routing\n  - show ip route\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | i ip routing",
            "out": "ip routing"
          },
          {
            "match": "show ip route",
            "out": "C 10.0.10.0/24 is directly connected, Vlan10\nC 10.0.20.0/24 is directly connected, Vlan20"
          }
        ],
        "PC10": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.0.20.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.0.20.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.0.20.10, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "PC20": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.0.10.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.0.10.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.0.10.10, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-03-dhcp-relay-missing-helper",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 40,
    "title": "DHCP Fails on VLAN30: Missing ip helper-address",
    "summary": "Central DHCP server exists, but MLS1 isn't relaying DHCP broadcasts from VLAN30.",
    "tags": [
      "DHCP",
      "ip helper-address",
      "SVI"
    ],
    "objectives": [
      "Confirm client has APIPA.",
      "Find missing helper on VLAN30 SVI.",
      "Add helper and verify lease."
    ],
    "topology": {
      "nodes": [
        {
          "id": "MLS1",
          "label": "MLS1\n(Gateway)",
          "x": 160,
          "y": 160
        },
        {
          "id": "R1",
          "label": "R1\n(DHCP)",
          "x": 340,
          "y": 160
        },
        {
          "id": "PC30",
          "label": "PC30\nVLAN30",
          "x": 160,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "MLS1",
          "b": "R1",
          "label": "10.0.0.0/30"
        },
        {
          "a": "MLS1",
          "b": "PC30",
          "label": "VLAN30"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> VLAN30 is at the branch, but DHCP is centralized on R1.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC30 shows 169.254.x.x.</li>\n      <li>R1 DHCP pool is configured.</li>\n      <li>L3 link between MLS1 and R1 is up.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>MLS1 SVI VLAN30 must have ip helper-address 10.0.0.2.</li>\n      <li>Client should receive 10.30.0.x.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check show run | sec interface vlan30.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC30 gets 10.30.0.x and gateway 10.30.0.1.</li>\n      <li>R1 shows a DHCP binding for VLAN30.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "MLS1 (starting)": "hostname MLS1\nip routing\ninterface g0/1\n ip address 10.0.0.1 255.255.255.252\n no shutdown\nvlan 30\ninterface vlan30\n ip address 10.30.0.1 255.255.255.0\n no shutdown\nend",
      "R1 (starting)": "hostname R1\ninterface g0/0\n ip address 10.0.0.2 255.255.255.252\n no shutdown\nip dhcp excluded-address 10.30.0.1 10.30.0.20\nip dhcp pool VLAN30\n network 10.30.0.0 255.255.255.0\n default-router 10.30.0.1\nend"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Add ip helper-address on VLAN30 SVI pointing to R1.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Add helper (MLS1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna03_fix1\">Copy</button>\n  <pre><code id=\"ccna03_fix1\">conf t\ninterface vlan30\n ip helper-address 10.0.0.2\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PC30 ipconfig shows 10.30.0.x.</li>\n  <li>R1 show ip dhcp binding shows a lease.</li>\n</ul>",
    "cli": {
      "devices": [
        "MLS1",
        "R1",
        "PC30"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "MLS1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec interface vlan30\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec interface vlan30",
            "out": "interface Vlan30\n ip address 10.30.0.1 255.255.255.0\n no shutdown"
          }
        ],
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp binding\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp binding",
            "out": "(none)"
          }
        ],
        "PC30": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 169.254.1.30\nGateway     : (none)\nDHCP        : FAILED"
          }
        ]
      },
      "fixed": {
        "MLS1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec interface vlan30\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec interface vlan30",
            "out": "interface Vlan30\n ip address 10.30.0.1 255.255.255.0\n ip helper-address 10.0.0.2\n no shutdown"
          }
        ],
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp binding\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp binding",
            "out": "10.30.0.10  (leased)  client-id 0100.50aa.bb30.30"
          }
        ],
        "PC30": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 10.0.0.2\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 10.30.0.10\nGateway     : 10.30.0.1"
          },
          {
            "match": "ping 10.0.0.2",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.0.0.2, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-04-etherchannel-lacp-mismatch",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 50,
    "title": "EtherChannel Down: 'on' vs LACP Mismatch",
    "summary": "Port-channel doesn't bundle because sides use different negotiation modes.",
    "tags": [
      "EtherChannel",
      "LACP",
      "Switching"
    ],
    "objectives": [
      "Check show etherchannel summary.",
      "Align channel-group mode.",
      "Verify Po1 trunking VLANs."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> SW1 and SW2 should form Po1 with LACP to carry user VLANs.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Po1 is down (SD).</li>\n      <li>Member ports are not in P state.</li>\n      <li>Hosts across switches can't communicate.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Use LACP on both ends.</li>\n      <li>Po1 must be trunking.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">One side is set to static 'on'.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Po1 shows SU and ports show P.</li>\n      <li>show interfaces trunk lists Po1.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface range gi0/1 - 2\n channel-group 1 mode on\n!",
      "SW2 (starting)": "interface range gi0/1 - 2\n channel-group 1 mode active\n!"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Convert SW1 to LACP to match SW2.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set SW1 to LACP active</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna04_fix1\">Copy</button>\n  <pre><code id=\"ccna04_fix1\">conf t\ninterface range gi0/1 - 2\n channel-group 1 mode active\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show etherchannel summary shows Po1(SU) with (P) ports.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show etherchannel summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show etherchannel summary",
            "out": "Po1(SD)  Ports: Gi0/1(D) Gi0/2(D)  Protocol: -"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show etherchannel summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show etherchannel summary",
            "out": "Po1(SD)  Ports: Gi0/1(D) Gi0/2(D)  Protocol: LACP"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show etherchannel summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show etherchannel summary",
            "out": "Po1(SU)  Ports: Gi0/1(P) Gi0/2(P)  Protocol: LACP"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show etherchannel summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show etherchannel summary",
            "out": "Po1(SU)  Ports: Gi0/1(P) Gi0/2(P)  Protocol: LACP"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-05-stp-root-wrong",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "STP Root Wrong: Access Switch Became Root",
    "summary": "Spanning Tree root is on the access layer instead of distribution.",
    "tags": [
      "STP",
      "Root Bridge",
      "Switching"
    ],
    "objectives": [
      "Identify current root for VLAN10.",
      "Make SW2 root primary.",
      "Verify root moves to SW2."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A priority change caused the access switch to become STP root for VLAN10.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show spanning-tree vlan 10 shows SW1 as root.</li>\n      <li>Design requires SW2 to be root.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Make SW2 root primary for VLAN10.</li>\n      <li>Keep RPVST enabled.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Align STP root with gateway devices.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>SW2 shows 'This bridge is the root' for VLAN10.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "spanning-tree mode rapid-pvst\nspanning-tree vlan 10 priority 0",
      "SW2 (starting)": "spanning-tree mode rapid-pvst\nspanning-tree vlan 10 priority 32768"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Lower SW2 priority for VLAN10 (e.g., 4096) so it becomes root.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set SW2 priority</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna05_fix1\">Copy</button>\n  <pre><code id=\"ccna05_fix1\">conf t\nspanning-tree vlan 10 priority 4096\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>SW2: show spanning-tree vlan 10 indicates it is root.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree vlan 10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree vlan 10",
            "out": "VLAN0010 Root ID Priority 0  This bridge is the root"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree vlan 10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree vlan 10",
            "out": "VLAN0010 Root ID Priority 0  This bridge is not the root"
          }
        ]
      },
      "fixed": {
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree vlan 10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree vlan 10",
            "out": "VLAN0010 Root ID Priority 4096  This bridge is the root"
          }
        ],
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree vlan 10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree vlan 10",
            "out": "VLAN0010 Root ID Priority 4096  This bridge is not the root"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-06-ospf-passive-interface",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "OSPF Neighbor Missing: passive-interface on Transit",
    "summary": "OSPF adjacency is down because the transit interface is passive.",
    "tags": [
      "OSPF",
      "Routing"
    ],
    "objectives": [
      "Check show ip ospf neighbor.",
      "Find passive-interface.",
      "Un-passive and verify routes."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> R1 and R2 should form OSPF over the transit link.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show ip ospf neighbor is empty.</li>\n      <li>PC-A cannot reach PC-B.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>OSPF process 1 must run on the transit interface.</li>\n      <li>Advertise both LANs.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Common when using 'passive-interface default'.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbor is FULL.</li>\n      <li>PC-A ping PC-B succeeds.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "router ospf 1\n passive-interface default\n no passive-interface g0/1\n network 10.0.0.0 0.0.0.3 area 0",
      "R2 (starting)": "router ospf 1\n network 10.0.0.0 0.0.0.3 area 0"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Remove passive-interface from the transit interface on R1.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Un-passive g0/0</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna06_fix1\">Copy</button>\n  <pre><code id=\"ccna06_fix1\">conf t\nrouter ospf 1\n no passive-interface g0/0\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R1: show ip ospf neighbor shows FULL.</li>\n  <li>PC-A ping PC-B works.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2",
        "PC-A"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n  - show ip protocols\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "(no OSPF neighbors)"
          },
          {
            "match": "show ip protocols",
            "out": "Routing Protocol is ospf 1\n Passive Interface(s): default\n Non Passive: Gi0/1"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "(no OSPF neighbors)"
          }
        ],
        "PC-A": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.2.2.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.2.2.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.2.2.10, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: No OSPF routes learned"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL on Gi0/0 (10.0.0.2)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL on Gi0/0 (10.0.0.1)"
          }
        ],
        "PC-A": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.2.2.10\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.2.2.10",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.2.2.10, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-07-ospf-hello-dead-mismatch",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 50,
    "title": "OSPF Down: Hello/Dead Timer Mismatch",
    "summary": "OSPF adjacency fails due to mismatched hello/dead timers on the transit interface.",
    "tags": [
      "OSPF",
      "Timers",
      "Troubleshooting"
    ],
    "objectives": [
      "Compare OSPF interface timers.",
      "Fix mismatch.",
      "Verify neighbor comes up."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A tuning change altered OSPF timers on R1, breaking adjacency to R2.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbors not formed.</li>\n      <li>R1 logs hello mismatch.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Hello/dead must match on both ends.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check show ip ospf interface g0/0.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbor is FULL.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n ip ospf hello-interval 5\n ip ospf dead-interval 20",
      "R2 (starting)": "interface g0/0\n ! default hello 10 dead 40"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Return R1 to default timers (or match R2).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Remove custom timers (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna07_fix1\">Copy</button>\n  <pre><code id=\"ccna07_fix1\">conf t\ninterface g0/0\n no ip ospf hello-interval\n no ip ospf dead-interval\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R1: show ip ospf neighbor shows FULL.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf interface g0/0\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf interface g0/0",
            "out": "Gi0/0 Hello 5 Dead 20"
          },
          {
            "match": "show ip ospf neighbor",
            "out": "%OSPF-4-ERRRCV: mismatched hello parameters from 10.0.0.2\n(no neighbors)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf interface g0/0",
            "out": "Gi0/0 Hello 10 Dead 40"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-08-nat-inside-outside-reversed",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "No Internet: NAT Inside/Outside Reversed",
    "summary": "LAN hosts can't reach the internet because NAT roles are applied to the wrong interfaces.",
    "tags": [
      "NAT",
      "PAT",
      "Edge"
    ],
    "objectives": [
      "Verify WAN is reachable.",
      "Check ip nat inside/outside.",
      "Correct and verify translations."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Edge)",
          "x": 120,
          "y": 80
        },
        {
          "id": "ISP",
          "label": "ISP\n(Sim)",
          "x": 320,
          "y": 80
        },
        {
          "id": "PC1",
          "label": "PC1\n(LAN)",
          "x": 120,
          "y": 300
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "ISP",
          "label": "WAN"
        },
        {
          "a": "R1",
          "b": "PC1",
          "label": "LAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> After a config template update, internet access stopped although WAN is up.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC1 can ping gateway.</li>\n      <li>PC1 cannot ping 8.8.8.8.</li>\n      <li>show ip nat translations is empty.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>LAN interface must be NAT inside.</li>\n      <li>WAN interface must be NAT outside.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check show run | sec interface.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC1 ping 8.8.8.8 succeeds.</li>\n      <li>R1 shows NAT translations.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n ip nat outside\n!\ninterface g0/1\n ip nat inside\n!\nip nat inside source list 1 interface g0/1 overload"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Swap NAT inside/outside assignments.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix NAT roles (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna08_fix1\">Copy</button>\n  <pre><code id=\"ccna08_fix1\">conf t\ninterface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R1 show ip nat translations populates while pinging 8.8.8.8.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "PC1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec interface\n  - show ip nat translations\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec interface",
            "out": "g0/0 ip nat outside\n g0/1 ip nat inside"
          },
          {
            "match": "show ip nat translations",
            "out": "(none)"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: No NAT translation due to reversed roles"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip nat translations\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip nat translations",
            "out": "icmp 203.0.113.2:100 192.168.1.10:100 8.8.8.8:100 8.8.8.8:100"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-09-wrong-default-route",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 30,
    "title": "Internet Down: Wrong Default Route Next-Hop",
    "summary": "Default route points to the wrong next hop after ISP cutover.",
    "tags": [
      "Static route",
      "Default route"
    ],
    "objectives": [
      "Inspect routing table.",
      "Fix default route.",
      "Verify internet reachability."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Edge)",
          "x": 120,
          "y": 80
        },
        {
          "id": "ISP",
          "label": "ISP\n(Sim)",
          "x": 320,
          "y": 80
        },
        {
          "id": "PC1",
          "label": "PC1\n(LAN)",
          "x": 120,
          "y": 300
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "ISP",
          "label": "WAN"
        },
        {
          "a": "R1",
          "b": "PC1",
          "label": "LAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> ISP gateway changed during cutover. Branch has wrong default gateway configured.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>R1 cannot ping ISP gateway.</li>\n      <li>R1 cannot ping 8.8.8.8.</li>\n      <li>show ip route shows gateway of last resort via wrong IP.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Default route must point to 203.0.113.1.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Start with show ip route.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>R1 ping 8.8.8.8 succeeds.</li>\n      <li>PC1 ping 8.8.8.8 succeeds.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "ip route 0.0.0.0 0.0.0.0 203.0.113.5"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Replace the default route with the correct ISP gateway.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Update default route (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna09_fix1\">Copy</button>\n  <pre><code id=\"ccna09_fix1\">conf t\nno ip route 0.0.0.0 0.0.0.0 203.0.113.5\nip route 0.0.0.0 0.0.0.0 203.0.113.1\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip route shows gateway of last resort 203.0.113.1.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "PC1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip route\n  - ping 203.0.113.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip route",
            "out": "Gateway of last resort is 203.0.113.5\nS* 0.0.0.0/0 via 203.0.113.5"
          },
          {
            "match": "ping 203.0.113.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 203.0.113.1, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Default route points to wrong next hop"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Edge router has wrong default route"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip route\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip route",
            "out": "Gateway of last resort is 203.0.113.1\nS* 0.0.0.0/0 via 203.0.113.1"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-10-vty-acl-blocks-admin",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 35,
    "title": "SSH Blocked: VTY access-class ACL Denies Admin Subnet",
    "summary": "Ping works, but SSH is denied by a misordered VTY ACL.",
    "tags": [
      "SSH",
      "VTY",
      "ACL"
    ],
    "objectives": [
      "Check line vty config.",
      "Inspect ACL order.",
      "Permit admin subnet and verify SSH."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Managed)",
          "x": 220,
          "y": 120
        },
        {
          "id": "PC-ADMIN",
          "label": "PC-ADMIN\n10.99.0.10",
          "x": 220,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "PC-ADMIN",
          "label": "Mgmt 10.99.0.0/24"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> After hardening, admins cannot SSH into R1.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC-ADMIN can ping 10.99.0.1.</li>\n      <li>SSH fails immediately.</li>\n      <li>VTY has access-class configured.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Permit 10.99.0.0/24 in VTY ACL.</li>\n      <li>Keep other subnets restricted.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Standard ACL line order matters.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC-ADMIN: ssh 10.99.0.1 succeeds (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "ip access-list standard VTY-MGMT\n deny 10.99.0.0 0.0.0.255\n permit 10.0.0.0 0.255.255.255\nline vty 0 4\n access-class VTY-MGMT in\n transport input ssh"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Update the VTY ACL to permit 10.99.0.0/24.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix ACL (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna10_fix1\">Copy</button>\n  <pre><code id=\"ccna10_fix1\">conf t\nip access-list standard VTY-MGMT\n no deny 10.99.0.0 0.0.0.255\n permit 10.99.0.0 0.0.0.255\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PC-ADMIN ssh 10.99.0.1 succeeds (simulated).</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "PC-ADMIN"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show access-lists\n  - show run | sec line vty\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show access-lists",
            "out": "VTY-MGMT\n 10 deny 10.99.0.0/24\n 20 permit 10.0.0.0/8"
          },
          {
            "match": "show run | sec line vty",
            "out": "line vty 0 4\n access-class VTY-MGMT in\n transport input ssh"
          }
        ],
        "PC-ADMIN": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.99.0.1\n  - ssh 10.99.0.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.99.0.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.99.0.1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          },
          {
            "match": "ssh 10.99.0.1",
            "out": "SSH failed: Access denied by VTY-MGMT"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show access-lists\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show access-lists",
            "out": "VTY-MGMT\n 10 permit 10.99.0.0/24\n 20 permit 10.0.0.0/8"
          }
        ],
        "PC-ADMIN": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ssh 10.99.0.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ssh 10.99.0.1",
            "out": "SSH to 10.99.0.1 successful (simulated)."
          }
        ]
      }
    }
  },
  {
    "id": "ccna-11-port-security-errdisable",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 30,
    "title": "User Down: Port-Security Violation (Err-Disabled)",
    "summary": "Access port is shut down due to port-security violation after a device move.",
    "tags": [
      "Port-Security",
      "Errdisable"
    ],
    "objectives": [
      "Identify err-disabled cause.",
      "Recover port safely.",
      "Verify user connectivity."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1\n(Access)",
          "x": 220,
          "y": 140
        },
        {
          "id": "PC1",
          "label": "PC1\n(User)",
          "x": 220,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Fa0/5 access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A user moved to another cubicle and plugged into a secured port.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Interface Fa0/5 is err-disabled.</li>\n      <li>Port-security violation counter increased.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Recover Fa0/5.</li>\n      <li>Keep port-security enabled.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Use show interface status and show port-security interface.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Fa0/5 becomes connected.</li>\n      <li>PC1 can ping gateway.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface fa0/5\n switchport port-security\n switchport port-security violation shutdown"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Shutdown/no shutdown the port and clear sticky MAC if policy requires.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Recover interface (SW1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna11_fix1\">Copy</button>\n  <pre><code id=\"ccna11_fix1\">conf t\ninterface fa0/5\n shutdown\n no shutdown\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show interface status shows Fa0/5 connected.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "PC1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n  - show port-security interface fa0/5\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5  err-disabled  vlan10"
          },
          {
            "match": "show port-security interface fa0/5",
            "out": "Port Status: Secure-shutdown\nViolation Count: 1"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.10.10.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.10.10.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.10.10.1, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Port is err-disabled"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5  connected  vlan10"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.10.10.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.10.10.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.10.10.1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-12-dtp-auto-auto",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 30,
    "title": "Trunk Not Forming: DTP Auto/Auto",
    "summary": "Both sides are dynamic auto; trunk never forms, so VLANs aren’t carried.",
    "tags": [
      "DTP",
      "Trunk",
      "VLAN"
    ],
    "objectives": [
      "Confirm no trunk.",
      "Identify dynamic auto.",
      "Force trunk and verify."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> SW1 uplink to SW2 should be a trunk to carry VLAN10 and VLAN20.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show interfaces trunk shows none.</li>\n      <li>Ports are in dynamic auto.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Set trunk mode on uplink.</li>\n      <li>Allow VLAN10,20.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">DTP requires one side to actively negotiate or be forced.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show interfaces trunk lists the uplink trunking VLAN10,20.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface gi0/1\n switchport mode dynamic auto",
      "SW2 (starting)": "interface gi0/1\n switchport mode dynamic auto"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Force trunk mode and allowed VLANs on both ends.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set trunk (both switches)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna12_fix1\">Copy</button>\n  <pre><code id=\"ccna12_fix1\">conf t\ninterface gi0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,20\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show interfaces trunk shows gi0/1 trunking.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n  - show run interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "No trunking ports"
          },
          {
            "match": "show run interface gi0/1",
            "out": "interface Gi0/1\n switchport mode dynamic auto"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface gi0/1",
            "out": "interface Gi0/1\n switchport mode dynamic auto"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking 802.1q native 1 allowed 10,20"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking 802.1q native 1 allowed 10,20"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-13-native-vlan-mismatch",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 40,
    "title": "Native VLAN Mismatch on Trunk",
    "summary": "Trunk is up but native VLANs differ, causing untagged traffic issues and mismatch warnings.",
    "tags": [
      "802.1Q",
      "Native VLAN",
      "Trunk"
    ],
    "objectives": [
      "Detect mismatch.",
      "Standardize native VLAN.",
      "Verify mismatch cleared."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A change request set native VLAN to 99 on one side only.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>CDP warns native VLAN mismatch.</li>\n      <li>Trunk reports different native VLANs.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Set native VLAN 99 on both ends.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Native VLAN mismatch can leak untagged frames into the wrong VLAN.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show interfaces trunk reports native VLAN 99 on both ends.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface gi0/1\n switchport mode trunk\n switchport trunk native vlan 1",
      "SW2 (starting)": "interface gi0/1\n switchport mode trunk\n switchport trunk native vlan 99"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Configure the same native VLAN on both ends.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set SW1 native VLAN 99</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna13_fix1\">Copy</button>\n  <pre><code id=\"ccna13_fix1\">conf t\ninterface gi0/1\n switchport trunk native vlan 99\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show interfaces trunk shows native 99 on both switches.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking native 1\n%CDP-4-NATIVE_VLAN_MISMATCH with SW2 Gi0/1 native 99"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking native 99"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking native 99 allowed 10,20,99"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking native 99 allowed 10,20,99"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-14-roas-dot1q-mismatch",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "Router-on-a-Stick: Wrong dot1Q VLAN on Subinterface",
    "summary": "VLAN20 clients can't reach their gateway due to subinterface encapsulation mismatch.",
    "tags": [
      "Router-on-a-stick",
      "802.1Q",
      "VLAN"
    ],
    "objectives": [
      "Inspect subinterface config.",
      "Correct encapsulation VLAN.",
      "Verify gateway ping."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(RoAS)",
          "x": 160,
          "y": 110
        },
        {
          "id": "SW1",
          "label": "SW1\n(Access)",
          "x": 160,
          "y": 230
        },
        {
          "id": "PC20",
          "label": "PC20\nVLAN20",
          "x": 160,
          "y": 360
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "SW1",
          "label": "Trunk"
        },
        {
          "a": "SW1",
          "b": "PC20",
          "label": "Access VLAN20"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> R1 provides gateway for VLAN20 over a trunk to SW1.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC20 cannot ping 10.20.0.1.</li>\n      <li>SW1 trunk allows VLAN20.</li>\n      <li>R1 subinterface exists but is mis-tagged.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>R1 G0/0.20 must use encapsulation dot1Q 20.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Copy/paste errors often set the wrong dot1Q VLAN ID.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC20 can ping 10.20.0.1.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0.20\n encapsulation dot1Q 30\n ip address 10.20.0.1 255.255.255.0",
      "SW1 (starting)": "interface g0/1\n switchport mode trunk\n switchport trunk allowed vlan 20"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Change encapsulation to dot1Q 20 on R1 subinterface.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix subinterface tagging (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna14_fix1\">Copy</button>\n  <pre><code id=\"ccna14_fix1\">conf t\ninterface g0/0.20\n encapsulation dot1Q 20\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R1 show run | sec g0/0.20 shows dot1Q 20.</li>\n  <li>PC20 ping 10.20.0.1 succeeds.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "SW1",
        "PC20"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec interface g0/0.20\n  - show ip int brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec interface g0/0.20",
            "out": "interface g0/0.20\n encapsulation dot1Q 30\n ip address 10.20.0.1 255.255.255.0"
          },
          {
            "match": "show ip int brief",
            "out": "g0/0.20 10.20.0.1 up down"
          }
        ],
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking allowed 20"
          }
        ],
        "PC20": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.20.0.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.20.0.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.20.0.1, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: R1 subinterface is not receiving VLAN20 tags"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip int brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip int brief",
            "out": "g0/0.20 10.20.0.1 up up"
          }
        ],
        "PC20": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ping 10.20.0.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ping 10.20.0.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.20.0.1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interfaces trunk\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interfaces trunk",
            "out": "Gi0/1 trunking allowed 20"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-15-dhcp-snooping-uplink-not-trusted",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 40,
    "title": "DHCP Snooping Breaks DHCP: Uplink Not Trusted",
    "summary": "After enabling DHCP snooping, clients fail to get a lease because the uplink to the DHCP server isn't trusted.",
    "tags": [
      "DHCP Snooping",
      "Switch Security",
      "Troubleshooting"
    ],
    "objectives": [
      "Confirm snooping is enabled.",
      "Find that uplink is untrusted.",
      "Trust uplink and verify leases."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1\n(Access)",
          "x": 160,
          "y": 170
        },
        {
          "id": "R1",
          "label": "R1\n(DHCP)",
          "x": 340,
          "y": 170
        },
        {
          "id": "PC1",
          "label": "PC1\n(Client)",
          "x": 160,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "R1",
          "label": "Uplink (should be trusted)"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access VLAN10"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Security enabled DHCP snooping to prevent rogue DHCP servers. Immediately, users stopped getting DHCP.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC1 gets 169.254.x.x.</li>\n      <li>DHCP server is R1 on uplink.</li>\n      <li>Switch is dropping DHCP offers.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Keep DHCP snooping enabled.</li>\n      <li>Trust only the uplink toward DHCP server.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">On access switches, user ports are untrusted by default.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC1 receives 10.10.10.x.</li>\n      <li>show ip dhcp snooping shows uplink trusted.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface g0/1\n description uplink-to-R1\n ! missing: ip dhcp snooping trust",
      "R1 (starting)": "ip dhcp pool VLAN10\n network 10.10.10.0 255.255.255.0\n default-router 10.10.10.1"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Trust the uplink interface toward the DHCP server.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Trust uplink (SW1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna15_fix1\">Copy</button>\n  <pre><code id=\"ccna15_fix1\">conf t\ninterface g0/1\n ip dhcp snooping trust\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>SW1: show ip dhcp snooping shows Gi0/1 trusted.</li>\n  <li>PC1 ipconfig shows valid lease.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "PC1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp snooping\n  - show ip dhcp snooping interface g0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp snooping",
            "out": "DHCP snooping is enabled\nDHCP snooping is configured on VLANs: 10"
          },
          {
            "match": "show ip dhcp snooping interface g0/1",
            "out": "Gi0/1  untrusted  rate-limit 15"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 169.254.10.15\nDHCP : FAILED"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip dhcp snooping interface g0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip dhcp snooping interface g0/1",
            "out": "Gi0/1  TRUSTED  rate-limit 15"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 10.10.10.1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 10.10.10.10\nGateway : 10.10.10.1"
          },
          {
            "match": "ping 10.10.10.1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 10.10.10.1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-16-bpduguard-errdisable",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 30,
    "title": "Port Err-Disabled: BPDU Guard Triggered",
    "summary": "A user connected a small switch, BPDU Guard shut the access port down.",
    "tags": [
      "STP",
      "BPDU Guard",
      "Errdisable"
    ],
    "objectives": [
      "Identify BPDU Guard as the cause.",
      "Recover the port.",
      "Prevent immediate re-trigger if device removed."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1\n(Access)",
          "x": 220,
          "y": 140
        },
        {
          "id": "PC1",
          "label": "PC1\n(User)",
          "x": 220,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Fa0/5 access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A meeting room port is portfast + bpduguard. Someone plugged in a switch.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Interface is err-disabled.</li>\n      <li>Logs show BPDU Guard.</li>\n      <li>User has no connectivity.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Recover port once the offending device is removed.</li>\n      <li>Keep BPDU Guard enabled.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">If the switch is still connected, it will err-disable again.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Interface returns to connected state.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface fa0/5\n spanning-tree portfast\n spanning-tree bpduguard enable"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Recover the port (shutdown/no shutdown) after removing the BPDU source.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Recover interface</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna16_fix1\">Copy</button>\n  <pre><code id=\"ccna16_fix1\">conf t\ninterface fa0/5\n shutdown\n no shutdown\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show interface status shows Fa0/5 connected.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n  - show log\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5 err-disabled"
          },
          {
            "match": "show log",
            "out": "%SPANTREE-2-BLOCK_BPDUGUARD: BPDU Guard blocking port Fa0/5"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5 connected"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-17-vlan-missing-causes-inactive-port",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 25,
    "title": "User Port Inactive: VLAN Missing on Switch",
    "summary": "An access port is assigned to a VLAN that doesn't exist, so the port becomes inactive.",
    "tags": [
      "VLAN",
      "Switching"
    ],
    "objectives": [
      "Check interface status.",
      "Check VLAN database.",
      "Create missing VLAN and verify."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1\n(Access)",
          "x": 220,
          "y": 140
        },
        {
          "id": "PC1",
          "label": "PC1\n(User)",
          "x": 220,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Fa0/5 access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A new VLAN30 was planned for a department. The port was set to VLAN30, but users have no link.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Fa0/5 is 'inactive'.</li>\n      <li>show vlan brief doesn't list VLAN30.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Create VLAN30 on SW1.</li>\n      <li>Keep the port in access VLAN30.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Ports assigned to non-existent VLANs become inactive on many platforms.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Fa0/5 becomes connected.</li>\n      <li>show vlan brief lists VLAN30.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface fa0/5\n switchport mode access\n switchport access vlan 30"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Create VLAN30 in the VLAN database.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Add VLAN30</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna17_fix1\">Copy</button>\n  <pre><code id=\"ccna17_fix1\">conf t\nvlan 30\n name DEPT30\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show vlan brief lists VLAN30.</li>\n  <li>show interface status shows Fa0/5 connected.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n  - show vlan brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5 inactive vlan30"
          },
          {
            "match": "show vlan brief",
            "out": "VLANs: 1,10,20 (VLAN30 missing)"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface status\n  - show vlan brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface status",
            "out": "Fa0/5 connected vlan30"
          },
          {
            "match": "show vlan brief",
            "out": "VLANs: 1,10,20,30"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-18-dhcp-wrong-default-router",
    "track": "CCNA",
    "difficulty": "Beginner",
    "minutes": 35,
    "title": "DHCP Clients Can’t Browse: Wrong Default Gateway in DHCP Pool",
    "summary": "Clients receive an IP but the DHCP pool hands out the wrong default-router.",
    "tags": [
      "DHCP",
      "Default Gateway",
      "Troubleshooting"
    ],
    "objectives": [
      "Check client gateway.",
      "Inspect DHCP pool.",
      "Fix default-router and verify."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Edge)",
          "x": 120,
          "y": 80
        },
        {
          "id": "ISP",
          "label": "ISP\n(Sim)",
          "x": 320,
          "y": 80
        },
        {
          "id": "PC1",
          "label": "PC1\n(LAN)",
          "x": 120,
          "y": 300
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "ISP",
          "label": "WAN"
        },
        {
          "a": "R1",
          "b": "PC1",
          "label": "LAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Helpdesk reports 'Wi‑Fi connected but no internet'. DHCP works but users still cannot reach outside.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PC1 gets 192.168.1.10 via DHCP.</li>\n      <li>PC1 gateway is 192.168.1.254 (wrong).</li>\n      <li>Ping to 8.8.8.8 fails.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>DHCP default-router must be 192.168.1.1.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Always verify host IP/gateway/DNS first.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PC1 gateway is 192.168.1.1.</li>\n      <li>PC1 can ping 8.8.8.8.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "ip dhcp pool LAN\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.254"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Correct the DHCP pool default-router to the actual gateway.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix DHCP pool (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna18_fix1\">Copy</button>\n  <pre><code id=\"ccna18_fix1\">conf t\nip dhcp pool LAN\n default-router 192.168.1.1\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PC1 ipconfig shows gateway 192.168.1.1.</li>\n  <li>PC1 ping 8.8.8.8 succeeds.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "PC1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec ip dhcp pool\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec ip dhcp pool",
            "out": "ip dhcp pool LAN\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.254"
          }
        ],
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 192.168.1.10\nGateway     : 192.168.1.254"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: Wrong default gateway from DHCP"
          }
        ]
      },
      "fixed": {
        "PC1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 8.8.8.8\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv4 Address : 192.168.1.10\nGateway     : 192.168.1.1"
          },
          {
            "match": "ping 8.8.8.8",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ],
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec ip dhcp pool\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec ip dhcp pool",
            "out": "ip dhcp pool LAN\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.1"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-19-duplex-mismatch",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 35,
    "title": "Intermittent Packet Loss: Duplex Mismatch on Uplink",
    "summary": "Users report slow network and packet loss due to duplex mismatch between switches.",
    "tags": [
      "Duplex",
      "Speed",
      "Interfaces",
      "Troubleshooting"
    ],
    "objectives": [
      "Check interface duplex/speed.",
      "Identify mismatch and errors.",
      "Set consistent negotiation and verify."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A technician hard-set duplex on one side of a link. Now the uplink shows errors and users complain.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>One side shows half-duplex, the other full.</li>\n      <li>Interface counters show late collisions / CRCs.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Set both sides to auto (or same hard settings).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Classic troubleshooting: mismatch causes collisions/CRC and poor performance.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Interfaces show matching duplex.</li>\n      <li>Errors stop increasing.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "interface gi0/1\n duplex full\n speed 100",
      "SW2 (starting)": "interface gi0/1\n duplex auto\n speed auto"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Return SW1 to auto negotiation to match SW2.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set SW1 gi0/1 to auto</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna19_fix1\">Copy</button>\n  <pre><code id=\"ccna19_fix1\">conf t\ninterface gi0/1\n duplex auto\n speed auto\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show interface gi0/1 shows full/auto and errors are stable.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface gi0/1",
            "out": "Gi0/1 is up, line protocol is up\n  Full-duplex, 100Mb/s\n  120 CRC, 45 late collisions"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface gi0/1",
            "out": "Gi0/1 is up, line protocol is up\n  Half-duplex, 100Mb/s\n  0 late collisions"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface gi0/1",
            "out": "Gi0/1 is up, line protocol is up\n  Full-duplex, 100Mb/s (auto)\n  CRC: 120 (not increasing)"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface gi0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface gi0/1",
            "out": "Gi0/1 is up, line protocol is up\n  Full-duplex, 100Mb/s (auto)"
          }
        ]
      }
    }
  },
  {
    "id": "ccna-20-ipv6-slaac-no-ra",
    "track": "CCNA",
    "difficulty": "Intermediate",
    "minutes": 35,
    "title": "IPv6 Clients Missing Address: Router Advertisements Suppressed",
    "summary": "IPv6 SLAAC fails because the router interface is suppressing RAs.",
    "tags": [
      "IPv6",
      "SLAAC",
      "RA",
      "Troubleshooting"
    ],
    "objectives": [
      "Verify client lacks global IPv6.",
      "Check router RA settings.",
      "Enable RAs and verify address."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(IPv6 GW)",
          "x": 220,
          "y": 120
        },
        {
          "id": "PCv6",
          "label": "PCv6\n(Client)",
          "x": 220,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "PCv6",
          "label": "LAN 2001:db8:10::/64"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> IPv6 was enabled for a new segment using SLAAC. Clients never get a global IPv6 address.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PCv6 only has link-local IPv6.</li>\n      <li>No default IPv6 route on PCv6.</li>\n      <li>Router interface is configured for IPv6.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Enable IPv6 RAs on R1 LAN interface.</li>\n      <li>Clients should autoconfigure 2001:db8:10::/64.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">If you see 'RA suppressed', SLAAC won't work.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PCv6 shows global IPv6 address.</li>\n      <li>PCv6 can ping 2001:db8:10::1.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n ipv6 address 2001:db8:10::1/64\n ipv6 nd ra suppress"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Stop suppressing router advertisements.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Enable RAs (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccna20_fix1\">Copy</button>\n  <pre><code id=\"ccna20_fix1\">conf t\ninterface g0/0\n no ipv6 nd ra suppress\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PCv6 shows global IPv6 2001:db8:10::/64 and can ping the gateway.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "PCv6"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ipv6 interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ipv6 interface g0/0",
            "out": "Gi0/0 is up\n  IPv6 address: 2001:db8:10::1/64\n  ND: Router Advertisements are suppressed"
          }
        ],
        "PCv6": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 2001:db8:10::1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv6 Address : fe80::1234 (link-local)\nDefault Route: (none)"
          },
          {
            "match": "ping 2001:db8:10::1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 2001:db8:10::1, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)\nHint: No global IPv6 / no default route"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ipv6 interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ipv6 interface g0/0",
            "out": "Gi0/0 is up\n  IPv6 address: 2001:db8:10::1/64\n  ND: Router Advertisements are sent every 200 seconds"
          }
        ],
        "PCv6": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - ipconfig\n  - ping 2001:db8:10::1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "ipconfig",
            "out": "IPv6 Address : 2001:db8:10::10\nDefault Route: fe80::1"
          },
          {
            "match": "ping 2001:db8:10::1",
            "out": "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 2001:db8:10::1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-01-ospf-auth-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "OSPF Adjacency Down: MD5 Authentication Mismatch",
    "summary": "OSPF neighbors fail to form because the message-digest key differs between routers.",
    "tags": [
      "OSPF",
      "Authentication",
      "MD5",
      "Troubleshooting"
    ],
    "objectives": [
      "Confirm OSPF auth is enabled.",
      "Find key mismatch.",
      "Fix key and verify FULL neighbor."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A security baseline enabled OSPF MD5. A single link now has no neighbors.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show ip ospf neighbor is empty.</li>\n      <li>show ip ospf interface shows message-digest authentication.</li>\n      <li>Logs mention auth key mismatch.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Use matching MD5 key and key-id on both ends.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check both 'ip ospf authentication message-digest' and 'message-digest-key'.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbor forms FULL.</li>\n      <li>Routes appear in routing table.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 CCNPkey",
      "R2 (starting)": "interface g0/0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 WrongKey"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Set the same MD5 key on both routers.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix key on R2</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp01_fix1\">Copy</button>\n  <pre><code id=\"ccnp01_fix1\">conf t\ninterface g0/0\n ip ospf message-digest-key 1 md5 CCNPkey\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R1: show ip ospf neighbor shows FULL.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf interface g0/0\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf interface g0/0",
            "out": "Gi0/0 OSPF area 0\n  Message-digest authentication enabled\n  Key 1 configured"
          },
          {
            "match": "show ip ospf neighbor",
            "out": "%OSPF-4-ERRRCV: Mismatch Authentication Key from 10.0.0.2\n(no neighbors)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface g0/0",
            "out": "interface g0/0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 WrongKey"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-02-ospf-area-mismatch",
    "track": "CCNP",
    "difficulty": "Intermediate",
    "minutes": 50,
    "title": "OSPF Neighbor Down: Area ID Mismatch on Transit Link",
    "summary": "OSPF adjacency fails because one router is configured for the wrong area on the transit interface.",
    "tags": [
      "OSPF",
      "Areas",
      "Troubleshooting"
    ],
    "objectives": [
      "Check OSPF interface area on both sides.",
      "Correct mismatch.",
      "Verify neighbor FULL."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A new WAN circuit was added and OSPF was configured quickly. No neighbor forms.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show ip ospf neighbor empty.</li>\n      <li>show ip ospf interface shows different areas.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Transit link must be in area 0 on both sides.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Area mismatch prevents adjacency.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Neighbor forms FULL.</li>\n      <li>Routes exchanged.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n ip ospf 10 area 0",
      "R2 (starting)": "interface g0/0\n ip ospf 10 area 10"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Place the transit interface in the same area on both ends.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix area on R2</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp02_fix1\">Copy</button>\n  <pre><code id=\"ccnp02_fix1\">conf t\ninterface g0/0\n ip ospf 10 area 0\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip ospf neighbor shows FULL.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf interface g0/0\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf interface g0/0",
            "out": "Gi0/0 Area 0"
          },
          {
            "match": "show ip ospf neighbor",
            "out": "(no neighbors)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf interface g0/0",
            "out": "Gi0/0 Area 10"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-03-ospf-mtu-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "OSPF Stuck in EXSTART: MTU Mismatch",
    "summary": "Neighbor relationship forms but stalls in EXSTART due to mismatched interface MTU.",
    "tags": [
      "OSPF",
      "MTU",
      "EXSTART"
    ],
    "objectives": [
      "Observe neighbor state.",
      "Check MTU on both sides.",
      "Fix MTU (or use ip ospf mtu-ignore) and verify FULL."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> An ISP handoff required jumbo MTU on one side. OSPF never reaches FULL.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Neighbor stuck in EXSTART/EXCHANGE.</li>\n      <li>Interface MTU differs between routers.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Match MTU or enable OSPF MTU ignore (per policy).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Start with show ip ospf neighbor and show interface (MTU).</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>OSPF reaches FULL.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "interface g0/0\n mtu 1500",
      "R2 (starting)": "interface g0/0\n mtu 9000"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Standardize MTU on both ends (example: 1500).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set R2 MTU to 1500</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp03_fix1\">Copy</button>\n  <pre><code id=\"ccnp03_fix1\">conf t\ninterface g0/0\n mtu 1500\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip ospf neighbor shows FULL (not EXSTART).</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n  - show interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 EXSTART"
          },
          {
            "match": "show interface g0/0",
            "out": "MTU 1500 bytes"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show interface g0/0\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show interface g0/0",
            "out": "MTU 9000 bytes"
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 EXSTART"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-04-ospf-stub-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "OSPF Won’t Neighbor: Stub Area Mismatch",
    "summary": "Routers disagree on stub/NSSA settings for an area, so adjacency fails with 'mismatched stub area'.",
    "tags": [
      "OSPF",
      "Stub Area",
      "NSSA"
    ],
    "objectives": [
      "Identify mismatched stub flags.",
      "Correct area type.",
      "Verify adjacency."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A branch area was converted to stub, but only one router was updated.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbors not formed.</li>\n      <li>Logs mention mismatched stub area.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Both routers must agree on area type (stub/NSSA/normal).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check router ospf configuration for the area.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>OSPF neighbor is FULL.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "router ospf 10\n area 10 stub",
      "R2 (starting)": "router ospf 10\n ! area 10 is normal here"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Configure the same stub setting on both sides (example: make R2 area 10 stub).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set R2 area 10 stub</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp04_fix1\">Copy</button>\n  <pre><code id=\"ccnp04_fix1\">conf t\nrouter ospf 10\n area 10 stub\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip ospf neighbor shows FULL.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "%OSPF-4-ERRRCV: Mismatched Stub Area from 10.0.0.2\n(no neighbors)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec router ospf\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec router ospf",
            "out": "router ospf 10\n router-id 2.2.2.2\n (no stub configured)"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 2.2.2.2 FULL"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip ospf neighbor\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip ospf neighbor",
            "out": "Neighbor 1.1.1.1 FULL"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-05-eigrp-kvalues-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 50,
    "title": "EIGRP Neighborship Down: K-Values Mismatch",
    "summary": "EIGRP neighbors won't form when K-values differ.",
    "tags": [
      "EIGRP",
      "K-values",
      "Troubleshooting"
    ],
    "objectives": [
      "Check show ip eigrp neighbors.",
      "Compare K-values.",
      "Restore default metrics and verify neighbors."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A WAN optimization template changed EIGRP metric weights on one router.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>No EIGRP neighbors.</li>\n      <li>R1 and R2 show different K-values in show ip protocols.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>K-values must match exactly (typically defaults).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">K-value mismatch prevents adjacency.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>EIGRP neighbors form.</li>\n      <li>Routes are exchanged.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "router eigrp 100\n metric weights 0 1 1 1 0 0",
      "R2 (starting)": "router eigrp 100\n metric weights 0 1 0 1 0 0\n ! default"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Reset metric weights on R1 to defaults (K1=1 K3=1, others 0).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Reset metric weights (R1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp05_fix1\">Copy</button>\n  <pre><code id=\"ccnp05_fix1\">conf t\nrouter eigrp 100\n no metric weights\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip eigrp neighbors shows adjacency.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip protocols\n  - show ip eigrp neighbors\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip protocols",
            "out": "EIGRP-IPv4 Protocol for AS(100)\n  Metric weight K1=1, K2=1, K3=1, K4=0, K5=0"
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "(no EIGRP neighbors)\n%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.0.2 is down: K-value mismatch"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip protocols\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip protocols",
            "out": "EIGRP-IPv4 Protocol for AS(100)\n  Metric weight K1=1, K2=0, K3=1, K4=0, K5=0"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip eigrp neighbors\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "Neighbor 2.2.2.2 (Gi0/0) is up"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip eigrp neighbors\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "Neighbor 1.1.1.1 (Gi0/0) is up"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-06-eigrp-auth-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "EIGRP Neighborship Flaps: Authentication Key Mismatch",
    "summary": "EIGRP neighbors fail because the key-chain/keys do not match on the adjacency interface.",
    "tags": [
      "EIGRP",
      "Authentication",
      "Key-chain"
    ],
    "objectives": [
      "Confirm auth is enabled.",
      "Find mismatch in key-chain/key-string.",
      "Fix and verify stable neighbors."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1",
          "x": 120,
          "y": 140
        },
        {
          "id": "R2",
          "label": "R2",
          "x": 320,
          "y": 140
        },
        {
          "id": "PC-A",
          "label": "PC-A",
          "x": 120,
          "y": 320
        },
        {
          "id": "PC-B",
          "label": "PC-B",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "R2",
          "label": "WAN / Transit"
        },
        {
          "a": "R1",
          "b": "PC-A",
          "label": "LAN A"
        },
        {
          "a": "R2",
          "b": "PC-B",
          "label": "LAN B"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A baseline enabled EIGRP authentication. One router was configured with the wrong key-string.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>No EIGRP neighbors or frequent flaps.</li>\n      <li>Logs mention authentication failed.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Both routers must use the same key-chain and key-string.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Check both the interface authentication settings and the key-chain contents.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show ip eigrp neighbors shows stable adjacency.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "key chain EIGRP-KEYS\n key 1\n  key-string ccnp123\ninterface g0/0\n ip authentication mode eigrp 100 md5\n ip authentication key-chain eigrp 100 EIGRP-KEYS",
      "R2 (starting)": "key chain EIGRP-KEYS\n key 1\n  key-string WRONG\ninterface g0/0\n ip authentication mode eigrp 100 md5\n ip authentication key-chain eigrp 100 EIGRP-KEYS"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Make the key-string identical on both routers.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix key-string on R2</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp06_fix1\">Copy</button>\n  <pre><code id=\"ccnp06_fix1\">conf t\nkey chain EIGRP-KEYS\n key 1\n  key-string ccnp123\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip eigrp neighbors forms and remains up.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip eigrp neighbors\n  - show log\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "(no EIGRP neighbors)"
          },
          {
            "match": "show log",
            "out": "%EIGRP-5-NBRCHANGE: Neighbor 10.0.0.2 down: Authentication failed"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec key chain\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec key chain",
            "out": "key chain EIGRP-KEYS\n key 1\n  key-string WRONG"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip eigrp neighbors\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "Neighbor 2.2.2.2 up on Gi0/0"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip eigrp neighbors\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip eigrp neighbors",
            "out": "Neighbor 1.1.1.1 up on Gi0/0"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-07-redistribution-missing-metric",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 60,
    "title": "Routes Missing After Redistribution: EIGRP Metric Not Set",
    "summary": "OSPF routes are redistributed into EIGRP, but EIGRP side doesn't install them due to missing metric/default-metric.",
    "tags": [
      "Redistribution",
      "OSPF",
      "EIGRP",
      "Metrics"
    ],
    "objectives": [
      "Identify missing route on EIGRP side.",
      "Inspect redistribution config.",
      "Set a metric/default-metric and verify routes appear."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R-OSPF",
          "label": "R-OSPF\n(OSPF)",
          "x": 80,
          "y": 160
        },
        {
          "id": "R-REDIST",
          "label": "R-REDIST\n(Redistribute)",
          "x": 220,
          "y": 160
        },
        {
          "id": "R-EIGRP",
          "label": "R-EIGRP\n(EIGRP)",
          "x": 360,
          "y": 160
        },
        {
          "id": "LAN-O",
          "label": "LAN-O\n172.16.50.0/24",
          "x": 80,
          "y": 340
        },
        {
          "id": "LAN-E",
          "label": "LAN-E\n10.50.0.0/24",
          "x": 360,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "R-OSPF",
          "b": "R-REDIST",
          "label": "OSPF"
        },
        {
          "a": "R-REDIST",
          "b": "R-EIGRP",
          "label": "EIGRP"
        },
        {
          "a": "R-OSPF",
          "b": "LAN-O",
          "label": "LAN"
        },
        {
          "a": "R-EIGRP",
          "b": "LAN-E",
          "label": "LAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> R-REDIST connects an OSPF domain (HQ) to an EIGRP domain (Branch). Branch does not learn HQ routes.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>R-EIGRP routing table lacks 172.16.50.0/24.</li>\n      <li>Redistribution is configured, but metric is missing.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Redistribute OSPF into EIGRP with an explicit metric (or default-metric).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">EIGRP requires a seed metric when redistributing.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>R-EIGRP learns 172.16.50.0/24 as an EX/EIGRP route.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R-REDIST (starting)": "router eigrp 100\n redistribute ospf 10"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Add an EIGRP seed metric for redistributed routes.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set default-metric under EIGRP</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp07_fix1\">Copy</button>\n  <pre><code id=\"ccnp07_fix1\">conf t\nrouter eigrp 100\n default-metric 10000 100 255 1 1500\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>R-EIGRP show ip route includes 172.16.50.0/24 via EIGRP external.</li>\n</ul>",
    "cli": {
      "devices": [
        "R-REDIST",
        "R-EIGRP"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R-REDIST": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec router eigrp\n  - show ip protocols\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec router eigrp",
            "out": "router eigrp 100\n redistribute ospf 10\n (no default-metric)"
          },
          {
            "match": "show ip protocols",
            "out": "EIGRP-IPv4 100\n Redistributing: ospf 10\n  Default metric is not set"
          }
        ],
        "R-EIGRP": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip route 172.16.50.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip route 172.16.50.0",
            "out": "% Network not in table"
          }
        ]
      },
      "fixed": {
        "R-REDIST": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip protocols\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip protocols",
            "out": "EIGRP-IPv4 100\n Redistributing: ospf 10\n  Default metric is 10000 100 255 1 1500"
          }
        ],
        "R-EIGRP": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip route 172.16.50.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip route 172.16.50.0",
            "out": "D EX 172.16.50.0/24 [170/...] via 10.0.0.2"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-08-bgp-remote-as-mismatch",
    "track": "CCNP",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "eBGP Session Idle: Remote-AS Mismatch",
    "summary": "BGP session stays Idle/Active because the configured remote-as is incorrect.",
    "tags": [
      "BGP",
      "eBGP",
      "Troubleshooting"
    ],
    "objectives": [
      "Check BGP summary.",
      "Compare AS numbers.",
      "Fix remote-as and verify Established."
    ],
    "topology": {
      "nodes": [
        {
          "id": "EDGE",
          "label": "EDGE\n(AS 65001)",
          "x": 140,
          "y": 140
        },
        {
          "id": "ISP",
          "label": "ISP\n(AS 65010)",
          "x": 320,
          "y": 140
        },
        {
          "id": "CORE",
          "label": "CORE\n(iBGP)",
          "x": 140,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "EDGE",
          "b": "ISP",
          "label": "eBGP 198.51.100.0/30"
        },
        {
          "a": "EDGE",
          "b": "CORE",
          "label": "iBGP 10.255.0.0/30"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> EDGE peers with ISP over eBGP. After a change, BGP is down.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show ip bgp summary shows Idle/Active.</li>\n      <li>Logs indicate bad peer AS.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>EDGE must peer to ISP AS 65010.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Remote-as must match the neighbor's local AS.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>BGP state is Established.</li>\n      <li>Routes are received from ISP.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "EDGE (starting)": "router bgp 65001\n neighbor 198.51.100.1 remote-as 65011"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Correct the remote-as on EDGE.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix neighbor remote-as</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp08_fix1\">Copy</button>\n  <pre><code id=\"ccnp08_fix1\">conf t\nrouter bgp 65001\n neighbor 198.51.100.1 remote-as 65010\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show ip bgp summary shows Established.</li>\n</ul>",
    "cli": {
      "devices": [
        "EDGE",
        "ISP"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "Neighbor 198.51.100.1  RemoteAS 65011  State Idle\n%BGP-3-NOTIFICATION: received from 198.51.100.1: Bad peer AS"
          }
        ],
        "ISP": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "Neighbor 198.51.100.2  RemoteAS 65001  State Active"
          }
        ]
      },
      "fixed": {
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "Neighbor 198.51.100.1  RemoteAS 65010  State Established"
          }
        ],
        "ISP": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "Neighbor 198.51.100.2  RemoteAS 65001  State Established"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-09-ibgp-next-hop-self-missing",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "iBGP Learned Route Not Usable: next-hop-self Missing",
    "summary": "CORE receives BGP routes from EDGE but cannot use them because next-hop is unreachable.",
    "tags": [
      "BGP",
      "iBGP",
      "next-hop-self"
    ],
    "objectives": [
      "Verify CORE receives prefixes.",
      "Identify unreachable next-hop.",
      "Enable next-hop-self on EDGE and verify route installs."
    ],
    "topology": {
      "nodes": [
        {
          "id": "EDGE",
          "label": "EDGE\n(AS 65001)",
          "x": 140,
          "y": 140
        },
        {
          "id": "ISP",
          "label": "ISP\n(AS 65010)",
          "x": 320,
          "y": 140
        },
        {
          "id": "CORE",
          "label": "CORE\n(iBGP)",
          "x": 140,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "EDGE",
          "b": "ISP",
          "label": "eBGP 198.51.100.0/30"
        },
        {
          "a": "EDGE",
          "b": "CORE",
          "label": "iBGP 10.255.0.0/30"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> EDGE learns internet prefixes from ISP and advertises them to CORE via iBGP.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>CORE shows BGP prefix but route is not installed.</li>\n      <li>Next-hop is ISP address, unreachable from CORE.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>EDGE must set next-hop-self toward CORE.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Common in iBGP: keep next-hop reachable, often via next-hop-self.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>CORE installs the BGP route and can reach external prefix (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "EDGE (starting)": "router bgp 65001\n neighbor 10.255.0.2 remote-as 65001\n ! missing: neighbor 10.255.0.2 next-hop-self"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Enable next-hop-self on EDGE for the iBGP neighbor.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set next-hop-self (EDGE)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp09_fix1\">Copy</button>\n  <pre><code id=\"ccnp09_fix1\">conf t\nrouter bgp 65001\n neighbor 10.255.0.2 next-hop-self\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>CORE: show ip bgp shows next-hop as EDGE, and route is installed.</li>\n</ul>",
    "cli": {
      "devices": [
        "EDGE",
        "CORE"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "iBGP neighbor 10.255.0.2 Established\neBGP neighbor 198.51.100.1 Established"
          }
        ],
        "CORE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp 203.0.113.0\n  - show ip route 203.0.113.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp 203.0.113.0",
            "out": "BGP routing table entry for 203.0.113.0/24\n  Next Hop: 198.51.100.1 (inaccessible)"
          },
          {
            "match": "show ip route 203.0.113.0",
            "out": "% Network not in table"
          }
        ]
      },
      "fixed": {
        "CORE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp 203.0.113.0\n  - show ip route 203.0.113.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp 203.0.113.0",
            "out": "BGP routing table entry for 203.0.113.0/24\n  Next Hop: 10.255.0.1"
          },
          {
            "match": "show ip route 203.0.113.0",
            "out": "B 203.0.113.0/24 via 10.255.0.1"
          }
        ],
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run | sec router bgp\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec router bgp",
            "out": "router bgp 65001\n neighbor 10.255.0.2 remote-as 65001\n neighbor 10.255.0.2 next-hop-self"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-10-bgp-prefixlist-blocks-default",
    "track": "CCNP",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "No Default Route from ISP: Prefix-List Blocks 0.0.0.0/0",
    "summary": "BGP session is up, but inbound prefix-list denies the default route.",
    "tags": [
      "BGP",
      "Prefix-List",
      "Route Policy"
    ],
    "objectives": [
      "Confirm BGP is Established.",
      "Check inbound policy.",
      "Fix prefix-list and verify default route installed."
    ],
    "topology": {
      "nodes": [
        {
          "id": "EDGE",
          "label": "EDGE\n(AS 65001)",
          "x": 140,
          "y": 140
        },
        {
          "id": "ISP",
          "label": "ISP\n(AS 65010)",
          "x": 320,
          "y": 140
        },
        {
          "id": "CORE",
          "label": "CORE\n(iBGP)",
          "x": 140,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "EDGE",
          "b": "ISP",
          "label": "eBGP 198.51.100.0/30"
        },
        {
          "a": "EDGE",
          "b": "CORE",
          "label": "iBGP 10.255.0.0/30"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> EDGE should receive only a default route from ISP. A prefix-list was added to filter routes.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>BGP is Established.</li>\n      <li>No 0.0.0.0/0 in BGP table.</li>\n      <li>Prefix-list is applied inbound.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Permit 0.0.0.0/0 in the inbound prefix-list.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Inbound policy errors can look like a 'routing' problem while the session is fine.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show ip route shows a BGP-learned default route.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "EDGE (starting)": "ip prefix-list ISP-IN seq 10 deny 0.0.0.0/0\nip prefix-list ISP-IN seq 20 permit 0.0.0.0/0 le 32\nrouter bgp 65001\n neighbor 198.51.100.1 remote-as 65010\n neighbor 198.51.100.1 prefix-list ISP-IN in"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Permit the default route (or remove the deny).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix prefix-list</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp10_fix1\">Copy</button>\n  <pre><code id=\"ccnp10_fix1\">conf t\nip prefix-list ISP-IN seq 10 no deny 0.0.0.0/0\nip prefix-list ISP-IN seq 10 permit 0.0.0.0/0\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>EDGE show ip bgp contains 0.0.0.0/0 and show ip route shows gateway of last resort via BGP.</li>\n</ul>",
    "cli": {
      "devices": [
        "EDGE"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp summary\n  - show ip bgp 0.0.0.0\n  - show run | sec prefix-list\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp summary",
            "out": "Neighbor 198.51.100.1 Established"
          },
          {
            "match": "show ip bgp 0.0.0.0",
            "out": "% Network not in table"
          },
          {
            "match": "show run | sec prefix-list",
            "out": "ip prefix-list ISP-IN seq 10 deny 0.0.0.0/0\nip prefix-list ISP-IN seq 20 permit 0.0.0.0/0 le 32"
          }
        ]
      },
      "fixed": {
        "EDGE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp 0.0.0.0\n  - show ip route 0.0.0.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp 0.0.0.0",
            "out": "*> 0.0.0.0/0 198.51.100.1"
          },
          {
            "match": "show ip route 0.0.0.0",
            "out": "B* 0.0.0.0/0 via 198.51.100.1"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-11-hsrp-tracking-missing",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "HSRP Blackhole: Missing Interface Tracking",
    "summary": "HSRP stays Active on a router that lost its upstream, causing traffic blackholing.",
    "tags": [
      "HSRP",
      "FHRP",
      "Tracking"
    ],
    "objectives": [
      "Verify HSRP state and priorities.",
      "Detect missing track statement.",
      "Add tracking so failover occurs when uplink fails."
    ],
    "topology": {
      "nodes": [
        {
          "id": "CORE",
          "label": "CORE\n(L3)",
          "x": 200,
          "y": 60
        },
        {
          "id": "DIST1",
          "label": "DIST1\n(HSRP/OSPF)",
          "x": 70,
          "y": 190
        },
        {
          "id": "DIST2",
          "label": "DIST2\n(HSRP/OSPF)",
          "x": 330,
          "y": 190
        },
        {
          "id": "BR1",
          "label": "BR1\n(Branch)",
          "x": 200,
          "y": 320
        },
        {
          "id": "PC110",
          "label": "PC110\nVLAN110",
          "x": 70,
          "y": 340
        },
        {
          "id": "PC120",
          "label": "PC120\nVLAN120",
          "x": 330,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "CORE",
          "b": "DIST1",
          "label": "P2P / OSPF"
        },
        {
          "a": "CORE",
          "b": "DIST2",
          "label": "P2P / OSPF"
        },
        {
          "a": "CORE",
          "b": "BR1",
          "label": "WAN / OSPF"
        },
        {
          "a": "DIST1",
          "b": "PC110",
          "label": "VLAN110"
        },
        {
          "a": "DIST2",
          "b": "PC120",
          "label": "VLAN120"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> DIST1 and DIST2 provide gateway redundancy for VLAN110. DIST1 lost its uplink but still remains HSRP Active.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Clients intermittently lose connectivity during uplink failure.</li>\n      <li>DIST1 remains Active even when uplink is down.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>HSRP must track the uplink interface and reduce priority when it fails.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Tracking prevents blackholing when the gateway loses upstream reachability.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>When uplink fails, DIST2 becomes Active (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "DIST1 (starting)": "interface vlan110\n standby 110 ip 10.110.0.1\n standby 110 priority 110\n standby 110 preempt\n ! missing: standby 110 track g0/1 30",
      "DIST2 (starting)": "interface vlan110\n standby 110 ip 10.110.0.1\n standby 110 priority 100\n standby 110 preempt"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Add an HSRP track statement on DIST1 to decrement priority when uplink fails.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Configure tracking (DIST1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp11_fix1\">Copy</button>\n  <pre><code id=\"ccnp11_fix1\">conf t\ninterface vlan110\n standby 110 track g0/1 30\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show standby brief reflects effective priority and Active/Standby roles.</li>\n</ul>",
    "cli": {
      "devices": [
        "DIST1",
        "DIST2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "DIST1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n  - show run interface vlan110\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan110  Active  local  priority 110  (no tracking)"
          },
          {
            "match": "show run interface vlan110",
            "out": "interface Vlan110\n standby 110 ip 10.110.0.1\n standby 110 priority 110\n standby 110 preempt"
          }
        ],
        "DIST2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan110  Standby  local  priority 100"
          }
        ]
      },
      "fixed": {
        "DIST1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n  - show run interface vlan110\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface vlan110",
            "out": "interface Vlan110\n standby 110 ip 10.110.0.1\n standby 110 priority 110\n standby 110 preempt\n standby 110 track g0/1 30"
          },
          {
            "match": "show standby brief",
            "out": "Vlan110  Standby  local  priority 80 (tracked)"
          }
        ],
        "DIST2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan110  Active  local  priority 100"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-12-hsrp-version-mismatch",
    "track": "CCNP",
    "difficulty": "Intermediate",
    "minutes": 45,
    "title": "HSRP Peers Not Seen: Version Mismatch (v1 vs v2)",
    "summary": "HSRP fails to form because one device runs HSRP version 1 and the other version 2.",
    "tags": [
      "HSRP",
      "Version",
      "FHRP"
    ],
    "objectives": [
      "Check HSRP version on both devices.",
      "Align versions.",
      "Verify Active/Standby relationship."
    ],
    "topology": {
      "nodes": [
        {
          "id": "CORE",
          "label": "CORE\n(L3)",
          "x": 200,
          "y": 60
        },
        {
          "id": "DIST1",
          "label": "DIST1\n(HSRP/OSPF)",
          "x": 70,
          "y": 190
        },
        {
          "id": "DIST2",
          "label": "DIST2\n(HSRP/OSPF)",
          "x": 330,
          "y": 190
        },
        {
          "id": "BR1",
          "label": "BR1\n(Branch)",
          "x": 200,
          "y": 320
        },
        {
          "id": "PC110",
          "label": "PC110\nVLAN110",
          "x": 70,
          "y": 340
        },
        {
          "id": "PC120",
          "label": "PC120\nVLAN120",
          "x": 330,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "CORE",
          "b": "DIST1",
          "label": "P2P / OSPF"
        },
        {
          "a": "CORE",
          "b": "DIST2",
          "label": "P2P / OSPF"
        },
        {
          "a": "CORE",
          "b": "BR1",
          "label": "WAN / OSPF"
        },
        {
          "a": "DIST1",
          "b": "PC110",
          "label": "VLAN110"
        },
        {
          "a": "DIST2",
          "b": "PC120",
          "label": "VLAN120"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> DIST1 and DIST2 should run HSRP for VLAN120 but both appear Active or speak to unknown peer.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>HSRP state is Active on both devices.</li>\n      <li>No hello communication due to version mismatch.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Use HSRP version 2 on both distribution switches.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">HSRPv1 and HSRPv2 are not compatible.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>One device becomes Active, the other Standby.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "DIST1 (starting)": "interface vlan120\n standby version 2\n standby 120 ip 10.120.0.1",
      "DIST2 (starting)": "interface vlan120\n ! default v1\n standby 120 ip 10.120.0.1"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Configure the same HSRP version on DIST2.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Set HSRP version 2 (DIST2)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp12_fix1\">Copy</button>\n  <pre><code id=\"ccnp12_fix1\">conf t\ninterface vlan120\n standby version 2\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show standby brief shows one Active and one Standby.</li>\n</ul>",
    "cli": {
      "devices": [
        "DIST1",
        "DIST2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "DIST1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan120  Active  local (v2)  peer: unknown"
          }
        ],
        "DIST2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n  - show run interface vlan120\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan120  Active  local (v1)  peer: unknown"
          },
          {
            "match": "show run interface vlan120",
            "out": "interface Vlan120\n standby 120 ip 10.120.0.1"
          }
        ]
      },
      "fixed": {
        "DIST1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan120  Active  local (v2)  peer: 10.120.0.3"
          }
        ],
        "DIST2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show standby brief\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show standby brief",
            "out": "Vlan120  Standby local (v2)  peer: 10.120.0.2"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-13-vrf-interface-not-assigned",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "VRF Lite Issue: Interface Not in VRF",
    "summary": "Customer interface is missing 'vrf forwarding', so customer routes don't appear in the VRF table.",
    "tags": [
      "VRF",
      "VRF Lite",
      "Segmentation"
    ],
    "objectives": [
      "Confirm VRF exists.",
      "Check interface VRF assignment.",
      "Assign interface to VRF and verify routing."
    ],
    "topology": {
      "nodes": [
        {
          "id": "PE",
          "label": "PE\n(VRF Lite)",
          "x": 220,
          "y": 120
        },
        {
          "id": "CE",
          "label": "CE\n(Customer)",
          "x": 220,
          "y": 300
        },
        {
          "id": "INET",
          "label": "INET\n(Global)",
          "x": 380,
          "y": 120
        }
      ],
      "links": [
        {
          "a": "PE",
          "b": "CE",
          "label": "Gi0/0 (should be VRF BLUE)"
        },
        {
          "a": "PE",
          "b": "INET",
          "label": "Global/WAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A provider edge (PE) uses VRF BLUE for a customer. Customer cannot reach PE services in VRF.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show ip route vrf BLUE is empty.</li>\n      <li>Interface toward CE is in global routing table.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Assign CE-facing interface to VRF BLUE.</li>\n      <li>Ensure correct VRF routes exist.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Moving an interface into a VRF requires re-applying the IP address.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show ip route vrf BLUE includes connected CE subnet.</li>\n      <li>Ping within VRF works (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "PE (starting)": "ip vrf BLUE\n rd 65001:10\n!\ninterface g0/0\n description to CE\n ip address 10.10.10.1 255.255.255.252\n ! missing: vrf forwarding BLUE"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Place the interface into VRF BLUE and reconfigure its IP address.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Assign interface to VRF</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp13_fix1\">Copy</button>\n  <pre><code id=\"ccnp13_fix1\">conf t\ninterface g0/0\n ip vrf forwarding BLUE\n ip address 10.10.10.1 255.255.255.252\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PE: show ip route vrf BLUE shows connected 10.10.10.0/30.</li>\n</ul>",
    "cli": {
      "devices": [
        "PE"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "PE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip vrf\n  - show run interface g0/0\n  - show ip route vrf BLUE\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip vrf",
            "out": "Name  Default RD\nBLUE  65001:10"
          },
          {
            "match": "show run interface g0/0",
            "out": "interface g0/0\n ip address 10.10.10.1 255.255.255.252"
          },
          {
            "match": "show ip route vrf BLUE",
            "out": "% No routes in VRF BLUE"
          }
        ]
      },
      "fixed": {
        "PE": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run interface g0/0\n  - show ip route vrf BLUE\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface g0/0",
            "out": "interface g0/0\n ip vrf forwarding BLUE\n ip address 10.10.10.1 255.255.255.252"
          },
          {
            "match": "show ip route vrf BLUE",
            "out": "C 10.10.10.0/30 is directly connected, Gi0/0"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-14-vrf-rt-import-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 60,
    "title": "VPN Routes Missing: VRF Route-Target Import Mismatch",
    "summary": "VPNv4 routes exist in BGP, but VRF doesn't import them due to incorrect route-target import.",
    "tags": [
      "MPLS",
      "L3VPN",
      "VRF",
      "Route-Target",
      "BGP"
    ],
    "objectives": [
      "Confirm VPNv4 routes are present.",
      "Check VRF RT import/export.",
      "Fix RT import and verify remote routes appear."
    ],
    "topology": {
      "nodes": [
        {
          "id": "PE1",
          "label": "PE1",
          "x": 100,
          "y": 150
        },
        {
          "id": "PE2",
          "label": "PE2",
          "x": 340,
          "y": 150
        },
        {
          "id": "P",
          "label": "P\n(Core)",
          "x": 220,
          "y": 60
        },
        {
          "id": "CE1",
          "label": "CE1\nSite1",
          "x": 100,
          "y": 340
        },
        {
          "id": "CE2",
          "label": "CE2\nSite2",
          "x": 340,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "PE1",
          "b": "P",
          "label": "MPLS Core"
        },
        {
          "a": "PE2",
          "b": "P",
          "label": "MPLS Core"
        },
        {
          "a": "PE1",
          "b": "CE1",
          "label": "VRF BLUE"
        },
        {
          "a": "PE2",
          "b": "CE2",
          "label": "VRF BLUE"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Two sites should communicate over MPLS L3VPN in VRF BLUE. Site1 cannot reach Site2 subnet.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>PE1 has VPNv4 routes for VRF BLUE but not installed in VRF RIB.</li>\n      <li>VRF import RT is wrong on PE1.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>VRF BLUE must import RT 65001:10.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">VRF RD is not used for policy; RT controls import/export.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PE1 show ip route vrf BLUE includes remote site prefix.</li>\n      <li>Ping between sites works (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "PE1 (starting)": "ip vrf BLUE\n rd 65001:10\n route-target export 65001:10\n route-target import 65001:11"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Correct the route-target import to match the exported RT.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix RT import (PE1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp14_fix1\">Copy</button>\n  <pre><code id=\"ccnp14_fix1\">conf t\nip vrf BLUE\n no route-target import 65001:11\n route-target import 65001:10\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PE1 show ip route vrf BLUE shows remote prefix (e.g., 10.2.0.0/24).</li>\n</ul>",
    "cli": {
      "devices": [
        "PE1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "PE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show bgp vpnv4 all\n  - show ip route vrf BLUE\n  - show run | sec ip vrf BLUE\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show bgp vpnv4 all",
            "out": "Route Distinguisher: 65001:10\n *> 10.2.0.0/24 via 192.0.2.2 (RT 65001:10)"
          },
          {
            "match": "show ip route vrf BLUE",
            "out": "C 10.1.0.0/24 is directly connected\n (no 10.2.0.0/24)"
          },
          {
            "match": "show run | sec ip vrf BLUE",
            "out": "ip vrf BLUE\n rd 65001:10\n route-target export 65001:10\n route-target import 65001:11"
          }
        ]
      },
      "fixed": {
        "PE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip route vrf BLUE\n  - show run | sec ip vrf BLUE\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec ip vrf BLUE",
            "out": "ip vrf BLUE\n rd 65001:10\n route-target export 65001:10\n route-target import 65001:10"
          },
          {
            "match": "show ip route vrf BLUE",
            "out": "C 10.1.0.0/24 is directly connected\nB 10.2.0.0/24 via 192.0.2.2"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-15-pbr-not-applied",
    "track": "CCNP",
    "difficulty": "Intermediate",
    "minutes": 50,
    "title": "PBR Not Working: route-map Not Applied to Interface",
    "summary": "Policy-Based Routing is configured, but traffic is not policy-routed because ip policy isn't applied.",
    "tags": [
      "PBR",
      "Route-map",
      "Troubleshooting"
    ],
    "objectives": [
      "Verify route-map exists.",
      "Confirm interface lacks ip policy.",
      "Apply and verify traffic takes intended path."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(PBR)",
          "x": 220,
          "y": 120
        },
        {
          "id": "ISP1",
          "label": "ISP1",
          "x": 80,
          "y": 320
        },
        {
          "id": "ISP2",
          "label": "ISP2",
          "x": 360,
          "y": 320
        },
        {
          "id": "LAN",
          "label": "LAN\n10.10.0.0/24",
          "x": 220,
          "y": 360
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "ISP1",
          "label": "Gi0/1"
        },
        {
          "a": "R1",
          "b": "ISP2",
          "label": "Gi0/2"
        },
        {
          "a": "R1",
          "b": "LAN",
          "label": "Gi0/0"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Voice subnet should exit ISP2 regardless of the routing table. Users report voice still exits ISP1.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>route-map PBR-VOICE exists.</li>\n      <li>Traffic still follows normal routing.</li>\n      <li>LAN interface missing ip policy.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Apply ip policy route-map PBR-VOICE inbound on LAN interface.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">PBR is enforced inbound on an interface, not globally.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show run interface g0/0 includes ip policy route-map.</li>\n      <li>show route-map / counters increment (simulated).</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "access-list 101 permit ip 10.10.0.0 0.0.0.255 any\nroute-map PBR-VOICE permit 10\n match ip address 101\n set ip next-hop 203.0.113.2\ninterface g0/0\n ip address 10.10.0.1 255.255.255.0\n ! missing: ip policy route-map PBR-VOICE"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Apply ip policy route-map PBR-VOICE to the inbound LAN interface.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Apply PBR to LAN interface</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp15_fix1\">Copy</button>\n  <pre><code id=\"ccnp15_fix1\">conf t\ninterface g0/0\n ip policy route-map PBR-VOICE\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show run interface g0/0 shows ip policy route-map PBR-VOICE.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show route-map\n  - show run interface g0/0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show route-map",
            "out": "route-map PBR-VOICE, permit, sequence 10\n  Match clauses: ip address (access-lists): 101\n  Set clauses: ip next-hop 203.0.113.2\n  Policy routing matches: 0 packets"
          },
          {
            "match": "show run interface g0/0",
            "out": "interface g0/0\n ip address 10.10.0.1 255.255.255.0\n (no ip policy)"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show run interface g0/0\n  - show route-map\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface g0/0",
            "out": "interface g0/0\n ip address 10.10.0.1 255.255.255.0\n ip policy route-map PBR-VOICE"
          },
          {
            "match": "show route-map",
            "out": "route-map PBR-VOICE, permit, sequence 10\n  Policy routing matches: 120 packets"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-16-mst-region-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "MST Misbehavior: Region Mismatch Between Switches",
    "summary": "MST boundary forms because switches have different region name/revision/VLAN-to-instance mapping.",
    "tags": [
      "MST",
      "Spanning Tree",
      "Region",
      "Switching"
    ],
    "objectives": [
      "Check MST config digest.",
      "Identify mismatch.",
      "Align region parameters and verify they match."
    ],
    "topology": {
      "nodes": [
        {
          "id": "SW1",
          "label": "SW1",
          "x": 160,
          "y": 160
        },
        {
          "id": "SW2",
          "label": "SW2",
          "x": 320,
          "y": 160
        },
        {
          "id": "PC1",
          "label": "PC1",
          "x": 160,
          "y": 320
        },
        {
          "id": "PC2",
          "label": "PC2",
          "x": 320,
          "y": 320
        }
      ],
      "links": [
        {
          "a": "SW1",
          "b": "SW2",
          "label": "Uplink"
        },
        {
          "a": "SW1",
          "b": "PC1",
          "label": "Access"
        },
        {
          "a": "SW2",
          "b": "PC2",
          "label": "Access"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Campus is migrating to MST. Two distribution switches should be in the same MST region.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>Port shows as MST boundary.</li>\n      <li>show spanning-tree mst configuration shows different digest.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Match MST region name, revision, and VLAN mapping.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Any difference in name/rev/mapping causes a region mismatch.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>Switches report identical MST configuration digest.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "SW1 (starting)": "spanning-tree mode mst\nspanning-tree mst configuration\n name CAMPUS\n revision 1\n instance 1 vlan 10-19",
      "SW2 (starting)": "spanning-tree mode mst\nspanning-tree mst configuration\n name CAMPUS\n revision 2\n instance 1 vlan 10-20"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Make SW2 MST region parameters match SW1.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix MST config (SW2)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp16_fix1\">Copy</button>\n  <pre><code id=\"ccnp16_fix1\">conf t\nspanning-tree mst configuration\n name CAMPUS\n revision 1\n instance 1 vlan 10-19\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show spanning-tree mst configuration shows same digest on both switches.</li>\n</ul>",
    "cli": {
      "devices": [
        "SW1",
        "SW2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree mst configuration\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree mst configuration",
            "out": "Name CAMPUS  Revision 1\nDigest 0xAAAA1111\nInstance 1 VLANs 10-19"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree mst configuration\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree mst configuration",
            "out": "Name CAMPUS  Revision 2\nDigest 0xBBBB2222\nInstance 1 VLANs 10-20"
          }
        ]
      },
      "fixed": {
        "SW1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree mst configuration\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree mst configuration",
            "out": "Name CAMPUS  Revision 1\nDigest 0xAAAA1111\nInstance 1 VLANs 10-19"
          }
        ],
        "SW2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show spanning-tree mst configuration\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show spanning-tree mst configuration",
            "out": "Name CAMPUS  Revision 1\nDigest 0xAAAA1111\nInstance 1 VLANs 10-19"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-17-qos-policy-wrong-direction",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 55,
    "title": "QoS Not Taking Effect: Service-Policy Applied in Wrong Direction",
    "summary": "A QoS policy exists but counters stay at zero because it’s applied outbound instead of inbound (or vice versa).",
    "tags": [
      "QoS",
      "Policy-map",
      "Service-policy"
    ],
    "objectives": [
      "Check policy-map interface counters.",
      "Verify direction of service-policy.",
      "Apply in correct direction and verify counters increment."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(Edge)",
          "x": 120,
          "y": 80
        },
        {
          "id": "ISP",
          "label": "ISP\n(Sim)",
          "x": 320,
          "y": 80
        },
        {
          "id": "PC1",
          "label": "PC1\n(LAN)",
          "x": 120,
          "y": 300
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "ISP",
          "label": "WAN"
        },
        {
          "a": "R1",
          "b": "PC1",
          "label": "LAN"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Voice traffic should be prioritized on the WAN ingress, but jitter persists.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>policy-map exists.</li>\n      <li>show policy-map interface shows 0 packets matched.</li>\n      <li>Service-policy is applied to wrong direction.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Apply the policy-map in the correct direction (example: input on WAN).</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">QoS is direction-sensitive; shaping vs policing differs too.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show policy-map interface shows counters increasing.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "class-map match-any VOICE\n match dscp ef\npolicy-map WAN-IN\n class VOICE\n  priority percent 30\n class class-default\n  fair-queue\ninterface g0/1\n description WAN\n service-policy output WAN-IN"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Move the service-policy to the correct direction (input on WAN).\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Apply policy inbound</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp17_fix1\">Copy</button>\n  <pre><code id=\"ccnp17_fix1\">conf t\ninterface g0/1\n no service-policy output WAN-IN\n service-policy input WAN-IN\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show policy-map interface g0/1 input shows matched packets > 0.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show policy-map interface g0/1\n  - show run interface g0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface g0/1",
            "out": "interface g0/1\n service-policy output WAN-IN"
          },
          {
            "match": "show policy-map interface g0/1",
            "out": "GigabitEthernet0/1\n Service-policy output: WAN-IN\n  Class VOICE: 0 packets"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show policy-map interface g0/1\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show policy-map interface g0/1",
            "out": "GigabitEthernet0/1\n Service-policy input: WAN-IN\n  Class VOICE: 250 packets"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-18-dmvpn-nhrp-networkid-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 65,
    "title": "DMVPN Spokes Not Registering: NHRP Network-ID Mismatch",
    "summary": "Spokes cannot register to hub because NHRP network-id differs, preventing NHRP adjacency.",
    "tags": [
      "DMVPN",
      "NHRP",
      "mGRE",
      "VPN"
    ],
    "objectives": [
      "Check DMVPN/NHRP status.",
      "Compare NHRP network-id.",
      "Fix mismatch and verify registration."
    ],
    "topology": {
      "nodes": [
        {
          "id": "HUB",
          "label": "HUB\n(DMVPN)",
          "x": 220,
          "y": 80
        },
        {
          "id": "SPOKE1",
          "label": "SPOKE1",
          "x": 80,
          "y": 260
        },
        {
          "id": "SPOKE2",
          "label": "SPOKE2",
          "x": 360,
          "y": 260
        },
        {
          "id": "INET",
          "label": "INET\n(Sim)",
          "x": 220,
          "y": 350
        }
      ],
      "links": [
        {
          "a": "HUB",
          "b": "INET",
          "label": "Public/WAN"
        },
        {
          "a": "SPOKE1",
          "b": "INET",
          "label": "Public/WAN"
        },
        {
          "a": "SPOKE2",
          "b": "INET",
          "label": "Public/WAN"
        },
        {
          "a": "HUB",
          "b": "SPOKE1",
          "label": "mGRE (tunnel)"
        },
        {
          "a": "HUB",
          "b": "SPOKE2",
          "label": "mGRE (tunnel)"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> A DMVPN Phase 2 network connects branches. One spoke cannot build the tunnel/registration.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show dmvpn shows NHRP down for SPOKE1.</li>\n      <li>No NHRP registration on HUB.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>NHRP network-id must match between hub and spoke.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">NHRP network-id is a common copy/paste mismatch.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>SPOKE1 registers to HUB (simulated).</li>\n      <li>show dmvpn lists spoke as UP.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "HUB (starting)": "interface Tunnel0\n ip nhrp network-id 10",
      "SPOKE1 (starting)": "interface Tunnel0\n ip nhrp network-id 11"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Set SPOKE1 network-id to match the hub.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix NHRP network-id (SPOKE1)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp18_fix1\">Copy</button>\n  <pre><code id=\"ccnp18_fix1\">conf t\ninterface Tunnel0\n ip nhrp network-id 10\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>HUB: show dmvpn shows SPOKE1 as registered.</li>\n  <li>SPOKE1: show dmvpn shows UP.</li>\n</ul>",
    "cli": {
      "devices": [
        "HUB",
        "SPOKE1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "HUB": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show dmvpn\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show dmvpn",
            "out": "Tunnel0, NHRP peers: (none)"
          }
        ],
        "SPOKE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show dmvpn\n  - show run interface tunnel0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run interface tunnel0",
            "out": "interface Tunnel0\n ip nhrp network-id 11"
          },
          {
            "match": "show dmvpn",
            "out": "Tunnel0 is up\n NHRP: DOWN (network-id mismatch suspected)"
          }
        ]
      },
      "fixed": {
        "HUB": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show dmvpn\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show dmvpn",
            "out": "Tunnel0, NHRP peers:\n  10.0.0.2 (SPOKE1) UP"
          }
        ],
        "SPOKE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show dmvpn\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show dmvpn",
            "out": "Tunnel0 is up\n NHRP: UP, Registered to HUB"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-19-ipsec-psk-mismatch",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 60,
    "title": "Site-to-Site VPN Down: Pre-Shared Key Mismatch",
    "summary": "IKE Phase 1 fails due to mismatched PSK, so IPsec tunnel never comes up.",
    "tags": [
      "IPsec",
      "IKE",
      "Crypto",
      "VPN"
    ],
    "objectives": [
      "Check IKE/IPsec SA status.",
      "Identify PSK mismatch.",
      "Fix PSK and verify tunnel up."
    ],
    "topology": {
      "nodes": [
        {
          "id": "R1",
          "label": "R1\n(VPN)",
          "x": 140,
          "y": 160
        },
        {
          "id": "R2",
          "label": "R2\n(VPN)",
          "x": 320,
          "y": 160
        },
        {
          "id": "INET",
          "label": "INET\n(Sim)",
          "x": 220,
          "y": 60
        },
        {
          "id": "LAN1",
          "label": "LAN1\n10.1.0.0/24",
          "x": 140,
          "y": 340
        },
        {
          "id": "LAN2",
          "label": "LAN2\n10.2.0.0/24",
          "x": 320,
          "y": 340
        }
      ],
      "links": [
        {
          "a": "R1",
          "b": "INET",
          "label": "WAN"
        },
        {
          "a": "R2",
          "b": "INET",
          "label": "WAN"
        },
        {
          "a": "R1",
          "b": "LAN1",
          "label": "LAN"
        },
        {
          "a": "R2",
          "b": "LAN2",
          "label": "LAN"
        },
        {
          "a": "R1",
          "b": "R2",
          "label": "IPsec S2S"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> Two sites use a site-to-site IPsec VPN. After a key rotation, traffic stopped.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>show crypto isakmp sa shows MM_NO_STATE/AM_WAIT_MSG.</li>\n      <li>No IPsec SAs built.</li>\n      <li>Logs indicate authentication failure.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Configure matching pre-shared key on both peers.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">A single character typo in PSK breaks IKE.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>show crypto isakmp sa shows QM_IDLE (or established).</li>\n      <li>show crypto ipsec sa shows packets encaps/decaps.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "R1 (starting)": "crypto isakmp key MySecret address 203.0.113.2",
      "R2 (starting)": "crypto isakmp key WrongSecret address 203.0.113.1"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Correct the PSK on R2 to match R1.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Fix PSK (R2)</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp19_fix1\">Copy</button>\n  <pre><code id=\"ccnp19_fix1\">conf t\nno crypto isakmp key WrongSecret address 203.0.113.1\ncrypto isakmp key MySecret address 203.0.113.1\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>show crypto isakmp sa indicates established.</li>\n  <li>show crypto ipsec sa shows packets.</li>\n</ul>",
    "cli": {
      "devices": [
        "R1",
        "R2"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show crypto isakmp sa\n  - show crypto ipsec sa\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show crypto isakmp sa",
            "out": "dst 203.0.113.2  state MM_NO_STATE"
          },
          {
            "match": "show crypto ipsec sa",
            "out": "(no IPsec SAs)"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show crypto isakmp sa\n  - show log\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show crypto isakmp sa",
            "out": "dst 203.0.113.1  state MM_NO_STATE"
          },
          {
            "match": "show log",
            "out": "%CRYPTO-4-IKMP_BAD_AUTH: IKE authentication failed"
          }
        ]
      },
      "fixed": {
        "R1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show crypto isakmp sa\n  - show crypto ipsec sa\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show crypto isakmp sa",
            "out": "dst 203.0.113.2  state QM_IDLE"
          },
          {
            "match": "show crypto ipsec sa",
            "out": "pkts encaps: 120  pkts decaps: 118"
          }
        ],
        "R2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show crypto isakmp sa\n  - show crypto ipsec sa\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show crypto isakmp sa",
            "out": "dst 203.0.113.1  state QM_IDLE"
          },
          {
            "match": "show crypto ipsec sa",
            "out": "pkts encaps: 118  pkts decaps: 120"
          }
        ]
      }
    }
  },
  {
    "id": "ccnp-20-bgp-rr-missing-client",
    "track": "CCNP",
    "difficulty": "Advanced",
    "minutes": 60,
    "title": "iBGP Routes Not Propagated: Route-Reflector Client Missing",
    "summary": "Routes learned from one iBGP peer are not sent to another because the RR-client relationship is not configured.",
    "tags": [
      "BGP",
      "Route Reflector",
      "iBGP"
    ],
    "objectives": [
      "Confirm iBGP sessions are up.",
      "Verify RR is not reflecting routes.",
      "Configure route-reflector-client and verify routes appear."
    ],
    "topology": {
      "nodes": [
        {
          "id": "RR",
          "label": "RR\n(Route-Reflector)",
          "x": 220,
          "y": 80
        },
        {
          "id": "PE1",
          "label": "PE1\n(Client)",
          "x": 80,
          "y": 260
        },
        {
          "id": "PE2",
          "label": "PE2\n(Client)",
          "x": 360,
          "y": 260
        },
        {
          "id": "CE",
          "label": "CE\n(Upstream)",
          "x": 220,
          "y": 350
        }
      ],
      "links": [
        {
          "a": "RR",
          "b": "PE1",
          "label": "iBGP"
        },
        {
          "a": "RR",
          "b": "PE2",
          "label": "iBGP"
        },
        {
          "a": "PE1",
          "b": "CE",
          "label": "eBGP"
        }
      ]
    },
    "problemHtml": "<div class=\"notice warn small\">\n  <b>Scenario:</b> RR should reflect iBGP routes between PE1 and PE2. PE2 is missing routes originated from PE1.\n</div>\n\n<hr class=\"sep\" />\n\n<div class=\"split\">\n  <div>\n    <h3 style=\"margin:0 0 6px 0;\">Symptoms</h3>\n    <ul class=\"clean\">\n      <li>BGP sessions are Established.</li>\n      <li>PE2 does not learn 10.100.0.0/24.</li>\n      <li>RR is not configured to reflect to PE2.</li>\n    </ul>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Requirements</h3>\n    <ul class=\"clean\">\n      <li>Configure PE2 as a route-reflector-client of RR.</li>\n    </ul>\n  </div>\n\n  <div>\n    <div class=\"notice small\">Without RR, iBGP split-horizon prevents advertising iBGP-learned routes to other iBGP peers.</div>\n    <hr class=\"sep\" />\n    <h3 style=\"margin:0 0 6px 0;\">Success checks</h3>\n    <ul class=\"clean\">\n      <li>PE2 show ip bgp includes 10.100.0.0/24.</li>\n    </ul>\n  </div>\n</div>",
    "startingConfigs": {
      "RR (starting)": "router bgp 65001\n neighbor 10.0.0.1 remote-as 65001\n neighbor 10.0.0.2 remote-as 65001\n ! only PE1 is client\n neighbor 10.0.0.1 route-reflector-client"
    },
    "solutionHtml": "<div class=\"notice ok small\">\n  <b>Fix summary:</b> Mark PE2 as a route-reflector client on RR.\n</div>\n\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">1) Add RR client</h3>\n<div class=\"codeblock\">\n  <button class=\"copy-btn\" data-copy=\"ccnp20_fix1\">Copy</button>\n  <pre><code id=\"ccnp20_fix1\">conf t\nrouter bgp 65001\n neighbor 10.0.0.2 route-reflector-client\nend\nwr mem</code></pre>\n</div>\n<hr class=\"sep\" />\n\n<h3 style=\"margin:0 0 8px 0;\">Verification</h3>\n<ul class=\"clean\">\n  <li>PE2 show ip bgp includes 10.100.0.0/24 learned via RR.</li>\n</ul>",
    "cli": {
      "devices": [
        "RR",
        "PE2",
        "PE1"
      ],
      "modes": [
        "Broken",
        "Fixed"
      ],
      "broken": {
        "RR": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp neighbors 10.0.0.2 advertised-routes\n  - show run | sec router bgp\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show run | sec router bgp",
            "out": "router bgp 65001\n neighbor 10.0.0.1 remote-as 65001\n neighbor 10.0.0.1 route-reflector-client\n neighbor 10.0.0.2 remote-as 65001"
          },
          {
            "match": "show ip bgp neighbors 10.0.0.2 advertised-routes",
            "out": "(no routes advertised to 10.0.0.2)"
          }
        ],
        "PE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp",
            "out": "*> 10.100.0.0/24 locally originated"
          }
        ],
        "PE2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp 10.100.0.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp 10.100.0.0",
            "out": "% Network not in table"
          }
        ]
      },
      "fixed": {
        "RR": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp neighbors 10.0.0.2 advertised-routes\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp neighbors 10.0.0.2 advertised-routes",
            "out": "10.100.0.0/24"
          }
        ],
        "PE2": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp 10.100.0.0\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp 10.100.0.0",
            "out": "*> 10.100.0.0/24 via 10.0.0.254 (RR)"
          }
        ],
        "PE1": [
          {
            "match": "help",
            "out": "Available commands (this is a lightweight simulation):\n  - show ip bgp\n\nNotes:\n  • Commands are matched by exact text or simple patterns.\n  • Use the Mode dropdown to compare Broken vs Fixed behavior."
          },
          {
            "match": "show ip bgp",
            "out": "*> 10.100.0.0/24 locally originated"
          }
        ]
      }
    }
  }
];
