/* Real‑World Net Sim Labs (static SPA)
   - No external dependencies
   - Browser-only “CLI simulation” (predefined outputs)
*/

(function(){
  "use strict";

  /* ---------------------------
     Lab content (edit/add labs)
     --------------------------- */

  const LABS = [
    {
      id: "ccna-branch-guest-vlan-nat-acl",
      track: "CCNA",
      difficulty: "Intermediate",
      minutes: 45,
      title: "Branch Office Guest Wi‑Fi: VLANs + Router‑on‑a‑Stick + NAT + Guest ACL",
      summary:
        "Guests can't get an IP address. After you fix that, guests must only reach the internet (not internal staff resources).",
      tags: ["VLAN", "Trunk", "Router-on-a-stick", "DHCP", "NAT", "ACL", "Troubleshooting"],
      objectives: [
        "Restore DHCP for Guest VLAN 20 (Guest Wi‑Fi).",
        "Keep Staff VLAN 10 fully functional (internal + internet).",
        "Restrict Guest VLAN: internet only; no access to Staff VLAN or the file server.",
        "Verify with pings + show commands."
      ],
      topology: {
        nodes: [
          { id: "R1", label: "R1\n(Branch Router)", x: 120, y: 60 },
          { id: "SW1", label: "SW1\n(Access Switch)", x: 120, y: 180 },
          { id: "ISP", label: "ISP\n(Sim)", x: 320, y: 60 },
          { id: "PC-STAFF", label: "PC-STAFF\nVLAN 10", x: 40, y: 320 },
          { id: "SRV-FILE", label: "SRV-FILE\n10.10.10.50", x: 200, y: 320 },
          { id: "PC-GUEST", label: "PC-GUEST\nVLAN 20", x: 320, y: 320 }
        ],
        links: [
          { a: "R1", b: "SW1", label: "G0/0 ↔ G0/1 (802.1Q trunk)" },
          { a: "R1", b: "ISP", label: "G0/1 ↔ WAN (203.0.113.0/30)" },
          { a: "SW1", b: "PC-STAFF", label: "Access VLAN 10" },
          { a: "SW1", b: "SRV-FILE", label: "Access VLAN 10" },
          { a: "SW1", b: "PC-GUEST", label: "Access VLAN 20" }
        ]
      },

      /* Problem narrative shown to the student */
      problemHtml: `
        <div class="notice warn small">
          <b>Scenario:</b> You’re onsite at a branch office. A new Guest Wi‑Fi network was added (VLAN 20).
          Staff devices (VLAN 10) must continue to work normally.
        </div>

        <hr class="sep" />

        <div class="split">
          <div>
            <h3 style="margin:0 0 6px 0;">Symptoms</h3>
            <ul class="clean">
              <li><b>Guest Wi‑Fi clients</b> can join the SSID but <b>do not receive an IP address</b>.</li>
              <li><b>Staff</b> devices can access the file server <span class="kbd">10.10.10.50</span> and the internet.</li>
              <li>After DHCP is restored for guests, they must be <b>blocked from internal staff resources</b>.</li>
            </ul>

            <hr class="sep" />

            <h3 style="margin:0 0 6px 0;">Requirements</h3>
            <ul class="clean">
              <li>VLAN 10 (Staff): <span class="kbd">10.10.10.0/24</span>, gateway <span class="kbd">10.10.10.1</span></li>
              <li>VLAN 20 (Guest): <span class="kbd">10.10.20.0/24</span>, gateway <span class="kbd">10.10.20.1</span></li>
              <li>Guests can reach the internet through NAT, but <b>cannot</b> reach <span class="kbd">10.10.10.0/24</span></li>
            </ul>

            <div class="notice small" style="margin-top:12px;">
              Use the <b>Console</b> tab to run <span class="kbd">show</span> commands and test <span class="kbd">ping</span>
              from multiple devices.
            </div>
          </div>

          <div>
            <h3 style="margin:0 0 6px 0;">Quick environment notes</h3>
            <ul class="clean">
              <li>R1 does inter‑VLAN routing via subinterfaces (<b>router‑on‑a‑stick</b>).</li>
              <li>SW1 uplink to R1 should be an <b>802.1Q trunk</b>.</li>
              <li>R1 provides DHCP for both VLANs and performs NAT overload to the ISP.</li>
              <li>A standard ACL exists for “guest isolation” but may be missing or applied incorrectly.</li>
            </ul>

            <hr class="sep" />

            <h3 style="margin:0 0 6px 0;">Success checks</h3>
            <ul class="clean">
              <li>PC-GUEST gets <b>10.10.20.x</b> via DHCP.</li>
              <li>PC-GUEST can ping <b>8.8.8.8</b> (internet).</li>
              <li>PC-GUEST <b>cannot</b> ping <b>10.10.10.50</b> or any <b>10.10.10.0/24</b> host.</li>
            </ul>
          </div>
        </div>
      `,

      /* Starting configs (what you’d see in Packet Tracer/CML) */
      startingConfigs: {
        "R1 (starting)": `
hostname R1
!
interface GigabitEthernet0/0
 no shutdown
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.10.10.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.10.20.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside
 no shutdown
!
ip dhcp excluded-address 10.10.10.1 10.10.10.20
ip dhcp excluded-address 10.10.20.1 10.10.20.20
!
ip dhcp pool STAFF
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 1.1.1.1
!
ip dhcp pool GUEST
 network 10.10.20.0 255.255.255.0
 default-router 10.10.20.1
 dns-server 1.1.1.1
!
access-list 100 deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255
access-list 100 permit ip 10.10.20.0 0.0.0.255 any
!
ip access-list extended GUEST-INTERNET-ONLY
 remark (same logic, named ACL example)
 deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255
 permit ip 10.10.20.0 0.0.0.255 any
!
access-list 1 permit 10.10.0.0 0.0.255.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1
!
end
        `.trim(),

        "SW1 (starting)": `
hostname SW1
!
vlan 10
 name STAFF
vlan 20
 name GUEST
!
interface GigabitEthernet0/1
 description Uplink-to-R1
 switchport mode trunk
 switchport trunk allowed vlan 10
!
interface FastEthernet0/10
 description PC-STAFF
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
!
interface FastEthernet0/11
 description SRV-FILE
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
!
interface FastEthernet0/20
 description PC-GUEST (Wi-Fi AP)
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
!
end
        `.trim()
      },

      /* SOLUTION (separate) */
      solutionHtml: `
        <div class="notice ok small">
          <b>Fix summary:</b> 1) Allow VLAN 20 on the trunk between SW1 and R1.
          2) Apply the guest isolation ACL inbound on the VLAN 20 subinterface (R1 G0/0.20).
        </div>

        <hr class="sep" />

        <h3 style="margin:0 0 8px 0;">1) Fix the trunk (SW1)</h3>
        <div class="codeblock">
          <button class="copy-btn" data-copy="sw1fix1">Copy</button>
          <pre><code id="sw1fix1">conf t
interface g0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20
end
wr mem</code></pre>
        </div>

        <hr class="sep" />

        <h3 style="margin:0 0 8px 0;">2) Apply the guest ACL on R1 (VLAN 20)</h3>
        <div class="codeblock">
          <button class="copy-btn" data-copy="r1fix1">Copy</button>
          <pre><code id="r1fix1">conf t
!
! Apply EITHER the numbered ACL 100 OR the named ACL (pick one standard)
interface g0/0.20
 ip access-group 100 in
!
! (Optional) Remove any incorrect ACL placement if it existed elsewhere:
! interface g0/0.10
!  no ip access-group 100 in
end
wr mem</code></pre>
        </div>

        <hr class="sep" />

        <h3 style="margin:0 0 8px 0;">Verification checklist</h3>
        <ul class="clean">
          <li><span class="kbd">show interfaces trunk</span> on SW1 shows VLANs 10 and 20 allowed.</li>
          <li>PC-GUEST now gets <span class="kbd">10.10.20.x</span> from DHCP.</li>
          <li>From PC-GUEST: <span class="kbd">ping 8.8.8.8</span> works, but <span class="kbd">ping 10.10.10.50</span> fails.</li>
          <li>From PC-STAFF: internet + file server still work.</li>
        </ul>
      `,

      /* Browser CLI simulation content */
      cli: {
        devices: ["R1", "SW1", "PC-STAFF", "PC-GUEST"],
        modes: ["Broken", "Fixed"],

        
        progress: {
          autoSwitchFixedWhenComplete: true,
          stages: [
            {
              id: "stage-trunk",
              title: "Trunk carries VLAN 20 (DHCP restored)",
              requires: [
                { device: "SW1", cmds: ["switchport trunk allowed vlan 10,20"] }
              ],
              effects: [
                { device: "SW1", match: "show interfaces trunk", useMode: "fixed" },
                { device: "R1", match: "show ip dhcp binding", useMode: "fixed" },
                { device: "PC-GUEST", match: "ipconfig", useMode: "fixed" },
                { device: "PC-GUEST", matchRe: "^ping\\s+8\\.8\\.8\\.8$", action: "pingOk", ip: "8.8.8.8" },
                { device: "PC-GUEST", matchRe: "^ping\\s+10\\.10\\.10\\.50$", action: "pingOk", ip: "10.10.10.50" }
              ]
            },
            {
              id: "stage-guest-acl",
              title: "Guest isolation enforced (ACL applied)",
              requires: [
                { device: "R1", cmds: ["ip access-group 100 in"] }
              ],
              effects: [
                { device: "R1", match: "show run | sec interface", useMode: "fixed" },
                { device: "PC-GUEST", matchRe: "^ping\\s+10\\.10\\.10\\.50$", action: "pingFail", ip: "10.10.10.50", hint: "Blocked by guest ACL (as designed)." }
              ]
            }
          ]
        },/* Command handlers per device & mode.
           Each entry is an ordered list of handlers; first match wins.
           Handler match can be:
             - string (exact match after normalization)
             - regex {re: /.../i}
           Output is a string.
        */
        broken: {
          "R1": [
            { match: "help", out: helpText(["show ip int brief", "show run | sec interface", "show access-lists", "show ip dhcp binding", "show ip nat translations", "show ip route", "ping <ip>"]) },
            { match: "show ip int brief", out:
`Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0      unassigned      YES unset  up                    up
GigabitEthernet0/0.10   10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20   10.10.20.1      YES manual up                    up
GigabitEthernet0/1      203.0.113.2     YES manual up                    up` },
            { match: { re: /^show run \| sec interface$/i }, out:
`interface GigabitEthernet0/0
 no shutdown
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.10.10.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.10.20.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside
 no shutdown` },
            { match: "show access-lists", out:
`Standard IP access list 1
    10 permit 10.10.0.0, wildcard bits 0.0.255.255
Extended IP access list 100
    10 deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255
    20 permit ip 10.10.20.0 0.0.0.255 any
Extended IP access list GUEST-INTERNET-ONLY
    10 remark (same logic, named ACL example)
    20 deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255
    30 permit ip 10.10.20.0 0.0.0.255 any` },
            { match: "show ip dhcp binding", out:
`Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type
                Hardware address/
                User name
10.10.10.10     0100.50AA.BBCC.DD      Jan 15 2026 01:10 AM   Automatic
10.10.10.50     0100.50EE.FF11.22      Jan 15 2026 01:10 AM   Automatic` },
            { match: "show ip nat translations", out:
`Pro  Inside global         Inside local          Outside local         Outside global
icmp 203.0.113.2:2         10.10.10.10:2         8.8.8.8:2             8.8.8.8:2
udp  203.0.113.2:1031      10.10.10.10:1031      1.1.1.1:53            1.1.1.1:53` },
            { match: "show ip route", out:
`Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
C     10.10.10.0/24 is directly connected, GigabitEthernet0/0.10
C     10.10.20.0/24 is directly connected, GigabitEthernet0/0.20
C     203.0.113.0/30 is directly connected, GigabitEthernet0/1` },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingOk("8.8.8.8") },
            { match: { re: /^ping\s+10\.10\.10\.50$/i }, out: pingOk("10.10.10.50") },
            { match: { re: /^ping\s+10\.10\.20\.10$/i }, out: pingFail("10.10.20.10", "No response (guest host has no valid IP / not reachable).") },
          ],

          "SW1": [
            { match: "help", out: helpText(["show vlan brief", "show interfaces trunk", "show run | sec interface"]) },
            { match: "show vlan brief", out:
`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
10   STAFF                            active    Fa0/10, Fa0/11
20   GUEST                            active    Fa0/20` },
            { match: "show interfaces trunk", out:
`Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       10

Port        Vlans allowed and active in management domain
Gi0/1       10

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10` },
            { match: { re: /^show run \| sec interface$/i }, out:
`interface GigabitEthernet0/1
 description Uplink-to-R1
 switchport mode trunk
 switchport trunk allowed vlan 10
!
interface FastEthernet0/10
 description PC-STAFF
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
!
interface FastEthernet0/11
 description SRV-FILE
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
!
interface FastEthernet0/20
 description PC-GUEST (Wi-Fi AP)
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast` },
          ],

          "PC-STAFF": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`Ethernet adapter Ethernet0:
   IPv4 Address. . . . . . . . . . . : 10.10.10.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.10.1
   DNS Servers . . . . . . . . . . . : 1.1.1.1` },
            { match: { re: /^ping\s+10\.10\.10\.1$/i }, out: pingOk("10.10.10.1") },
            { match: { re: /^ping\s+10\.10\.10\.50$/i }, out: pingOk("10.10.10.50") },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingOk("8.8.8.8") },
          ],

          "PC-GUEST": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`Wireless adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 169.254.18.77
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : (none)
   DNS Servers . . . . . . . . . . . : (none)
   DHCP Enabled. . . . . . . . . . . : Yes (FAILED)` },
            { match: { re: /^ping\s+10\.10\.20\.1$/i }, out: pingFail("10.10.20.1", "Destination host unreachable (no DHCP / VLAN not reaching gateway).") },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingFail("8.8.8.8", "No default gateway.") },
          ]
        },

        fixed: {
          "R1": [
            { match: "help", out: helpText(["show ip int brief", "show run | sec interface", "show access-lists", "show ip dhcp binding", "ping <ip>"]) },
            { match: "show ip int brief", out:
`Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0      unassigned      YES unset  up                    up
GigabitEthernet0/0.10   10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20   10.10.20.1      YES manual up                    up
GigabitEthernet0/1      203.0.113.2     YES manual up                    up` },
            { match: { re: /^show run \| sec interface$/i }, out:
`interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.10.10.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.10.20.1 255.255.255.0
 ip nat inside
 ip access-group 100 in
!
interface GigabitEthernet0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside` },
            { match: "show ip dhcp binding", out:
`Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type
                Hardware address/
                User name
10.10.10.10     0100.50AA.BBCC.DD      Jan 15 2026 01:10 AM   Automatic
10.10.10.50     0100.50EE.FF11.22      Jan 15 2026 01:10 AM   Automatic
10.10.20.10     0100.50FE.ED12.34      Jan 15 2026 01:10 AM   Automatic` },
            { match: "show access-lists", out:
`Extended IP access list 100
    10 deny ip 10.10.20.0 0.0.0.255 10.10.10.0 0.0.0.255
    20 permit ip 10.10.20.0 0.0.0.255 any` },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingOk("8.8.8.8") },
            { match: { re: /^ping\s+10\.10\.10\.50$/i }, out: pingOk("10.10.10.50") },
            { match: { re: /^ping\s+10\.10\.20\.10$/i }, out: pingOk("10.10.20.10") },
          ],

          "SW1": [
            { match: "help", out: helpText(["show interfaces trunk", "show vlan brief"]) },
            { match: "show vlan brief", out:
`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
10   STAFF                            active    Fa0/10, Fa0/11
20   GUEST                            active    Fa0/20` },
            { match: "show interfaces trunk", out:
`Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       10,20

Port        Vlans allowed and active in management domain
Gi0/1       10,20

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20` },
          ],

          "PC-STAFF": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`Ethernet adapter Ethernet0:
   IPv4 Address. . . . . . . . . . . : 10.10.10.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.10.1
   DNS Servers . . . . . . . . . . . : 1.1.1.1` },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingOk("8.8.8.8") },
            { match: { re: /^ping\s+10\.10\.10\.50$/i }, out: pingOk("10.10.10.50") },
          ],

          "PC-GUEST": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`Wireless adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 10.10.20.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.20.1
   DNS Servers . . . . . . . . . . . : 1.1.1.1` },
            { match: { re: /^ping\s+10\.10\.20\.1$/i }, out: pingOk("10.10.20.1") },
            { match: { re: /^ping\s+8\.8\.8\.8$/i }, out: pingOk("8.8.8.8") },
            { match: { re: /^ping\s+10\.10\.10\.50$/i }, out: pingFail("10.10.10.50", "Blocked by guest ACL (as designed).") },
          ]
        }
      }
    },

    /* ---------------- CCNP LAB ---------------- */
    {
      id: "ccnp-hsrp-ospf-auth",
      track: "CCNP",
      difficulty: "Advanced",
      minutes: 70,
      title: "Campus Redundancy: HSRP + OSPF Multi‑Area (Auth Mismatch on DIST2)",
      summary:
        "VLAN120 users can reach the default gateway but cannot reach the branch subnet. VLAN110 works.",
      tags: ["HSRP", "OSPF", "Multi-area", "Authentication", "ABR", "Troubleshooting"],
      objectives: [
        "Restore OSPF adjacency between CORE and DIST2.",
        "Ensure HSRP load-sharing: DIST1 active for VLAN110, DIST2 active for VLAN120.",
        "Verify reachability to branch subnet 172.16.50.0/24 from both VLANs."
      ],
      topology: {
        nodes: [
          { id: "CORE", label: "CORE\n(OSPF Area 0)", x: 200, y: 60 },
          { id: "DIST1", label: "DIST1\n(ABR + HSRP)", x: 70, y: 190 },
          { id: "DIST2", label: "DIST2\n(ABR + HSRP)", x: 330, y: 190 },
          { id: "BR1", label: "BR1\n(Branch)", x: 200, y: 330 },
          { id: "PC110", label: "PC-VLAN110\n10.110.0.10", x: 30, y: 330 },
          { id: "PC120", label: "PC-VLAN120\n10.120.0.10", x: 370, y: 330 }
        ],
        links: [
          { a: "CORE", b: "DIST1", label: "G0/0 ↔ G0/0 (10.0.0.0/30, area 0, MD5)" },
          { a: "CORE", b: "DIST2", label: "G0/1 ↔ G0/0 (10.0.0.4/30, area 0, MD5)" },
          { a: "CORE", b: "BR1", label: "G0/2 ↔ G0/0 (10.0.1.0/30, area 0)" },
          { a: "DIST1", b: "PC110", label: "VLAN110 SVI (area 10)" },
          { a: "DIST2", b: "PC120", label: "VLAN120 SVI (area 10)" }
        ]
      },

      problemHtml: `
        <div class="notice warn small">
          <b>Scenario:</b> You support an enterprise campus with redundant distribution.
          HSRP provides the default gateway for end-user VLANs. OSPF is used end-to-end (multi-area).
        </div>

        <hr class="sep" />

        <div class="split">
          <div>
            <h3 style="margin:0 0 6px 0;">Symptoms</h3>
            <ul class="clean">
              <li>VLAN110 users (<span class="kbd">10.110.0.0/24</span>) can reach the branch subnet <span class="kbd">172.16.50.0/24</span>.</li>
              <li>VLAN120 users (<span class="kbd">10.120.0.0/24</span>) can ping their gateway but <b>cannot</b> reach <span class="kbd">172.16.50.0/24</span>.</li>
              <li>HSRP is supposed to be <b>load shared</b>: DIST1 active for VLAN110, DIST2 active for VLAN120.</li>
            </ul>

            <hr class="sep" />

            <h3 style="margin:0 0 6px 0;">Requirements</h3>
            <ul class="clean">
              <li>OSPF process 10, backbone = area 0. User SVIs are in area 10.</li>
              <li>OSPF adjacencies from CORE to both DIST switches must be <b>FULL</b>.</li>
              <li>HSRP VIPs: VLAN110 = <span class="kbd">10.110.0.1</span>, VLAN120 = <span class="kbd">10.120.0.1</span></li>
              <li>Branch subnet: <span class="kbd">172.16.50.0/24</span> behind BR1 (advertised in OSPF area 0)</li>
            </ul>
          </div>

          <div>
            <div class="notice small">
              Use <span class="kbd">show standby brief</span>, <span class="kbd">show ip ospf neighbor</span>,
              and <span class="kbd">show ip route</span> to isolate whether it’s <b>gateway</b>, <b>routing</b>,
              or <b>adjacency</b>.
            </div>

            <hr class="sep" />

            <h3 style="margin:0 0 6px 0;">Success checks</h3>
            <ul class="clean">
              <li>CORE has OSPF neighbors for <b>DIST1</b> and <b>DIST2</b>.</li>
              <li>DIST2 learns branch route <span class="kbd">172.16.50.0/24</span> via OSPF.</li>
              <li>PC120 can ping <span class="kbd">172.16.50.10</span> after the fix.</li>
            </ul>
          </div>
        </div>
      `,

      startingConfigs: {
        "CORE (starting)": `
hostname CORE
!
interface g0/0
 description to DIST1
 ip address 10.0.0.2 255.255.255.252
 ip ospf 10 area 0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 ccnp123
!
interface g0/1
 description to DIST2
 ip address 10.0.0.6 255.255.255.252
 ip ospf 10 area 0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 ccnp123
!
interface g0/2
 description to BR1
 ip address 10.0.1.1 255.255.255.252
 ip ospf 10 area 0
!
router ospf 10
 router-id 1.1.1.1
 passive-interface default
 no passive-interface g0/0
 no passive-interface g0/1
 no passive-interface g0/2
!
end
        `.trim(),

        "DIST1 (starting)": `
hostname DIST1
!
interface g0/0
 description to CORE
 ip address 10.0.0.1 255.255.255.252
 ip ospf 10 area 0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 ccnp123
!
interface vlan110
 ip address 10.110.0.2 255.255.255.0
 standby 110 ip 10.110.0.1
 standby 110 priority 110
 standby 110 preempt
 ip ospf 10 area 10
!
interface vlan120
 ip address 10.120.0.2 255.255.255.0
 standby 120 ip 10.120.0.1
 standby 120 priority 100
 standby 120 preempt
 ip ospf 10 area 10
!
router ospf 10
 router-id 2.2.2.2
 passive-interface default
 no passive-interface g0/0
!
end
        `.trim(),

        "DIST2 (starting)": `
hostname DIST2
!
interface g0/0
 description to CORE
 ip address 10.0.0.5 255.255.255.252
 ip ospf 10 area 0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 WRONGKEY
!
interface vlan110
 ip address 10.110.0.3 255.255.255.0
 standby 110 ip 10.110.0.1
 standby 110 priority 100
 standby 110 preempt
 ip ospf 10 area 10
!
interface vlan120
 ip address 10.120.0.3 255.255.255.0
 standby 120 ip 10.120.0.1
 standby 120 priority 110
 standby 120 preempt
 ip ospf 10 area 10
!
router ospf 10
 router-id 3.3.3.3
 passive-interface default
 no passive-interface g0/0
!
end
        `.trim(),

        "BR1 (starting)": `
hostname BR1
!
interface g0/0
 description to CORE
 ip address 10.0.1.2 255.255.255.252
 ip ospf 10 area 0
!
interface g0/1
 description Branch LAN
 ip address 172.16.50.1 255.255.255.0
 ip ospf 10 area 0
!
router ospf 10
 router-id 4.4.4.4
 passive-interface default
 no passive-interface g0/0
 no passive-interface g0/1
!
end
        `.trim()
      },

      solutionHtml: `
        <div class="notice ok small">
          <b>Root cause:</b> OSPF MD5 authentication mismatch between CORE and DIST2 on the uplink.
          DIST2 doesn’t form an adjacency, so it never learns the branch route.
          Since DIST2 is the active HSRP gateway for VLAN120, VLAN120 traffic gets blackholed.
        </div>

        <hr class="sep" />

        <h3 style="margin:0 0 8px 0;">Fix (DIST2 uplink to CORE)</h3>
        <div class="codeblock">
          <button class="copy-btn" data-copy="dist2fix">Copy</button>
          <pre><code id="dist2fix">conf t
interface g0/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 ccnp123
end
wr mem</code></pre>
        </div>

        <hr class="sep" />

        <h3 style="margin:0 0 8px 0;">Verify</h3>
        <ul class="clean">
          <li>On CORE: <span class="kbd">show ip ospf neighbor</span> shows both DIST1 and DIST2 in FULL state.</li>
          <li>On DIST2: <span class="kbd">show ip route 172.16.50.0</span> shows an OSPF-learned route.</li>
          <li>From PC120: <span class="kbd">ping 172.16.50.10</span> succeeds.</li>
        </ul>

        <div class="notice small" style="margin-top:12px;">
          <b>Real‑world note:</b> When HSRP/VRRP provides the active gateway, routing issues on the active gateway
          often present as “some VLANs fail, some work.” Always check <span class="kbd">show standby</span> + routing adjacencies together.
        </div>
      `,

      cli: {
        devices: ["CORE", "DIST1", "DIST2", "BR1", "PC110", "PC120"],
        modes: ["Broken", "Fixed"],
        
        progress: {
          autoSwitchFixedWhenComplete: true,
          stages: [
            {
              id: "stage-ospf-auth",
              title: "OSPF adjacency restored (auth fixed)",
              requires: [
                { device: "DIST2", cmds: ["ip ospf message-digest-key 1 md5 ccnp123"] }
              ],
              effects: [
                { device: "CORE", match: "show ip ospf neighbor", useMode: "fixed" },
                { device: "DIST2", match: "show ip ospf neighbor", useMode: "fixed" },
                { device: "DIST2", matchRe: "^show\s+ip\s+route\s+172\.16\.50\.0$", useMode: "fixed" },
                { device: "PC120", matchRe: "^ping\\s+172\\.16\\.50\\.10$", action: "pingOk", ip: "172.16.50.10" }
              ]
            }
          ]
        },broken: {
          "CORE": [
            { match: "help", out: helpText(["show ip ospf neighbor", "show ip route", "ping <ip>"]) },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/ -         00:00:36    10.0.0.1        GigabitEthernet0/0` },
            { match: "show ip route", out:
`O    10.110.0.0/24 [110/2] via 10.0.0.1, 00:12:21, GigabitEthernet0/0
O    10.120.0.0/24 [110/2] via 10.0.0.1, 00:12:21, GigabitEthernet0/0
O    172.16.50.0/24 [110/2] via 10.0.1.2, 00:12:07, GigabitEthernet0/2` },
            { match: { re: /^ping\s+10\.0\.0\.5$/i }, out: pingFail("10.0.0.5", "No response (OSPF auth mismatch prevents stable communication).") },
          ],
          "DIST1": [
            { match: "help", out: helpText(["show standby brief", "show ip ospf neighbor", "show ip route", "ping <ip>"]) },
            { match: "show standby brief", out:
`Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vlan110      110  110 P Active  local           10.110.0.3      10.110.0.1
Vlan120      120  100 P Standby 10.120.0.3      local           10.120.0.1` },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/ -         00:00:33    10.0.0.2        GigabitEthernet0/0` },
            { match: "show ip route", out:
`O    172.16.50.0/24 [110/2] via 10.0.0.2, 00:11:58, GigabitEthernet0/0
C    10.110.0.0/24 is directly connected, Vlan110
C    10.120.0.0/24 is directly connected, Vlan120` },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingOk("172.16.50.10") },
          ],
          "DIST2": [
            { match: "help", out: helpText(["show standby brief", "show ip ospf neighbor", "show ip route", "show ip route 172.16.50.0", "ping <ip>"]) },
            { match: "show standby brief", out:
`Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vlan110      110  100 P Standby 10.110.0.2      local           10.110.0.1
Vlan120      120  110 P Active  local           10.120.0.2      10.120.0.1` },
            { match: "show ip ospf neighbor", out:
`% OSPF-5-ADJCHG: Process 10, Nbr 1.1.1.1 on GigabitEthernet0/0 from INIT to DOWN, Neighbor Down: Dead timer expired
(There are currently no OSPF neighbors)` },
            { match: { re: /^show ip route 172\.16\.50\.0$/i }, out:
`% Network not in table` },
            { match: "show ip route", out:
`C    10.110.0.0/24 is directly connected, Vlan110
C    10.120.0.0/24 is directly connected, Vlan120
C    10.0.0.4/30 is directly connected, GigabitEthernet0/0` },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingFail("172.16.50.10", "No route to host (DIST2 is not learning branch routes).") },
          ],
          "BR1": [
            { match: "help", out: helpText(["show ip ospf neighbor", "show ip route", "ping <ip>"]) },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/ -         00:00:38    10.0.1.1        GigabitEthernet0/0` },
            { match: "show ip route", out:
`O    10.110.0.0/24 [110/2] via 10.0.1.1, 00:14:01, GigabitEthernet0/0
O    10.120.0.0/24 [110/2] via 10.0.1.1, 00:14:01, GigabitEthernet0/0
C    172.16.50.0/24 is directly connected, GigabitEthernet0/1` },
          ],
          "PC110": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`IPv4 Address : 10.110.0.10
Mask        : 255.255.255.0
Gateway     : 10.110.0.1 (HSRP VIP)
DNS         : 10.110.0.53` },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingOk("172.16.50.10") },
          ],
          "PC120": [
            { match: "help", out: helpText(["ipconfig", "ping <ip>"]) },
            { match: "ipconfig", out:
`IPv4 Address : 10.120.0.10
Mask        : 255.255.255.0
Gateway     : 10.120.0.1 (HSRP VIP)
DNS         : 10.110.0.53` },
            { match: { re: /^ping\s+10\.120\.0\.1$/i }, out: pingOk("10.120.0.1") },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingFail("172.16.50.10", "Request timed out (traffic is hitting DIST2, which has no route).") },
          ],
        },

        fixed: {
          "CORE": [
            { match: "help", out: helpText(["show ip ospf neighbor", "show ip route"]) },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/ -         00:00:36    10.0.0.1        GigabitEthernet0/0
3.3.3.3           1   FULL/ -         00:00:37    10.0.0.5        GigabitEthernet0/1` },
            { match: "show ip route", out:
`O    10.110.0.0/24 [110/2] via 10.0.0.1, 00:12:21, GigabitEthernet0/0
O    10.120.0.0/24 [110/2] via 10.0.0.5, 00:00:21, GigabitEthernet0/1
O    172.16.50.0/24 [110/2] via 10.0.1.2, 00:12:07, GigabitEthernet0/2` },
          ],
          "DIST1": [
            { match: "help", out: helpText(["show standby brief", "show ip ospf neighbor"]) },
            { match: "show standby brief", out:
`Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vlan110      110  110 P Active  local           10.110.0.3      10.110.0.1
Vlan120      120  100 P Standby 10.120.0.3      local           10.120.0.1` },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/ -         00:00:33    10.0.0.2        GigabitEthernet0/0` },
          ],
          "DIST2": [
            { match: "help", out: helpText(["show standby brief", "show ip ospf neighbor", "show ip route 172.16.50.0", "ping <ip>"]) },
            { match: "show standby brief", out:
`Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vlan110      110  100 P Standby 10.110.0.2      local           10.110.0.1
Vlan120      120  110 P Active  local           10.120.0.2      10.120.0.1` },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/ -         00:00:34    10.0.0.6        GigabitEthernet0/0` },
            { match: { re: /^show ip route 172\.16\.50\.0$/i }, out:
`O    172.16.50.0/24 [110/3] via 10.0.0.6, 00:00:18, GigabitEthernet0/0` },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingOk("172.16.50.10") },
          ],
          "BR1": [
            { match: "help", out: helpText(["show ip ospf neighbor"]) },
            { match: "show ip ospf neighbor", out:
`Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/ -         00:00:38    10.0.1.1        GigabitEthernet0/0` },
          ],
          "PC110": [
            { match: "help", out: helpText(["ping <ip>"]) },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingOk("172.16.50.10") },
          ],
          "PC120": [
            { match: "help", out: helpText(["ping <ip>"]) },
            { match: { re: /^ping\s+172\.16\.50\.10$/i }, out: pingOk("172.16.50.10") },
          ],
        }
      }
    }
  ];

  // If a full lab library is provided via assets/labs.js, prefer it.
  // (LABS is a const array; we can replace its contents safely.)
  if(Array.isArray(window.ITSDaksLabs) && window.ITSDaksLabs.length){
    LABS.splice(0, LABS.length, ...window.ITSDaksLabs);
  }

  /* ---------------------------
     Utilities
     --------------------------- */

  function escapeHtml(str){
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function normalizeCmd(cmd){
    return cmd.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function helpText(commands){
    return [
      "Available commands (this is a lightweight simulation):",
      ...commands.map(c => "  - " + c),
      "",
      "Notes:",
      "  • Commands are matched by exact text or simple patterns.",
      "  • Use the Mode dropdown to compare Broken vs Fixed behavior."
    ].join("\n");
  }

  /* ---------------------------
     Live network state (per-lab)
     - Tracks per-interface admin up/down, trunk allowed VLANs, and dot1Q requirements
     - Drives dynamic "show" outputs + topology link LEDs
     --------------------------- */

  function canonIfShort(name){
    const s = String(name||"").trim();
    if(!s) return "";
    const low = s.toLowerCase();

    if(low === "lo0" || low === "loop0") return "lo0";
    if(low.startsWith("loopback")) return "lo" + low.replace("loopback","").trim();
    if(low.startsWith("vlan")) return "vlan" + low.replace("vlan","").trim();

    const g = low.match(/^(gigabitethernet|gi|g)\s*([0-9\/\.]+)$/);
    if(g) return "g" + g[2].replace(/\s+/g,"");
    const f = low.match(/^(fastethernet|fa|f)\s*([0-9\/\.]+)$/);
    if(f) return "f" + f[2].replace(/\s+/g,"");
    const t = low.match(/^(tengigabitethernet|te|t)\s*([0-9\/\.]+)$/);
    if(t) return "te" + t[2].replace(/\s+/g,"");

    return low.replace(/\s+/g,"");
  }

  function displayIfName(shortName){
    const s = String(shortName||"");
    if(!s) return "";
    const m = s.match(/^([a-z]+)([0-9][0-9\/\.]*)$/i);
    if(!m) return s;
    const p = m[1].toLowerCase();
    const rest = m[2];
    if(p === "g" || p === "gi") return "GigabitEthernet" + rest;
    if(p === "f" || p === "fa") return "FastEthernet" + rest;
    if(p === "te" || p === "t") return "TenGigabitEthernet" + rest;
    if(p === "vlan") return "Vlan" + rest;
    if(p === "lo") return "Loopback" + rest;
    return s;
  }

  function isPcDevice(id){
    return /^pc/i.test(String(id||""));
  }
  function isSwitchDevice(id){
    return /^(sw|dist|core)/i.test(String(id||""));
  }

  function parseVlanList(s){
    const out = new Set();
    const t = String(s||"").trim();
    if(!t) return out;
    for(const part of t.split(",")){
      const p = part.trim();
      if(!p) continue;
      const r = p.match(/^(\d+)\s*-\s*(\d+)$/);
      if(r){
        let a = parseInt(r[1],10), b = parseInt(r[2],10);
        if(isFinite(a) && isFinite(b)){
          if(a>b){ const tmp=a; a=b; b=tmp; }
          for(let v=a; v<=b; v++) out.add(v);
        }
      }else{
        const n = parseInt(p,10);
        if(isFinite(n)) out.add(n);
      }
    }
    return out;
  }

  function linkKey(a,b){
    const x = String(a), y = String(b);
    return (x < y) ? `${x}--${y}` : `${y}--${x}`;
  }

  function ifacePoolFor(deviceId){
    const d = String(deviceId||"");
    if(isPcDevice(d)) return ["nic"];
    if(isSwitchDevice(d)){
      const pool = [];
      for(let i=1;i<=4;i++) pool.push(`g0/${i}`);
      for(let i=1;i<=24;i++) pool.push(`f0/${i}`);
      return pool;
    }
    return ["g0/0","g0/1","g0/2","g0/3"];
  }

  function ensureIface(net, dev, iface){
    net.ifaces[dev] = net.ifaces[dev] || Object.create(null);
    const i = canonIfShort(iface);
    if(!i) return null;
    if(!net.ifaces[dev][i]){
      net.ifaces[dev][i] = {
        adminUp: true,
        trunkMode: false,
        allowedVlans: null,      // null = all
        ip: "",
        mask: "",
      };
    }
    return net.ifaces[dev][i];
  }

  function buildLinkPorts(lab, net){
    if(net.linkPortsBuilt) return;
    net.linkPortsBuilt = true;
    net.linkPorts = Object.create(null);

    const nodes = (lab.topology && Array.isArray(lab.topology.nodes)) ? lab.topology.nodes : [];
    const links = (lab.topology && Array.isArray(lab.topology.links)) ? lab.topology.links : [];
    const nodeSet = new Set(nodes.map(n => n.id));

    const cursor = Object.create(null);
    for(const n of nodes) cursor[n.id] = 0;

    function takePort(dev){
      const pool = ifacePoolFor(dev);
      const idx = cursor[dev] || 0;
      cursor[dev] = idx + 1;
      return pool[Math.min(idx, pool.length-1)];
    }

    for(const ln of links){
      const a = ln.a, b = ln.b;
      if(!nodeSet.has(a) || !nodeSet.has(b)) continue;
      const k = linkKey(a,b);

      let aIf = "", bIf = "";
      const lbl = String(ln.label||"");
      const pair = lbl.match(/([A-Za-z]+[0-9][0-9\/\.]*)\s*[\u2194<>\-]+\s*([A-Za-z]+[0-9][0-9\/\.]*)/);
      if(pair){
        aIf = canonIfShort(pair[1]);
        bIf = canonIfShort(pair[2]);
      }else{
        aIf = takePort(a);
        bIf = takePort(b);
      }

      net.linkPorts[k] = { a, b, aIf, bIf, label: lbl };
      if(!isPcDevice(a)) ensureIface(net, a, aIf);
      if(!isPcDevice(b)) ensureIface(net, b, bIf);
    }
  }

  function parseStartingConfigsIntoNet(lab, net){
    const sc = lab.startingConfigs || {};
    for(const dev of Object.keys(sc)){
      const text = String(sc[dev]||"");
      let cur = "";
      for(const rawLine of text.split(/\r?\n/)){
        const line = rawLine.trim();
        if(!line) continue;
        const mIf = line.match(/^interface\s+(.+)$/i);
        if(mIf){
          cur = canonIfShort(mIf[1]);
          ensureIface(net, dev, cur);
          continue;
        }
        if(line.startsWith("!")) continue;
        if(!cur) continue;

        const st = ensureIface(net, dev, cur);
        if(/^shutdown$/i.test(line)) st.adminUp = false;
        if(/^no\s+shutdown$/i.test(line)) st.adminUp = true;

        if(/^switchport\s+mode\s+trunk$/i.test(line)) st.trunkMode = true;

        const swAllow = line.match(/^switchport\s+trunk\s+allowed\s+vlan\s+(.+)$/i);
        if(swAllow){
          const s = swAllow[1].trim();
          st.allowedVlans = /^all$/i.test(s) ? null : parseVlanList(s);
        }

        const enc = line.match(/^encapsulation\s+dot1q\s+(\d+)/i);
        if(enc){
          const vlan = parseInt(enc[1],10);
          const parent = canonIfShort(cur.split(".")[0]);
          net.dot1qReq[dev] = net.dot1qReq[dev] || Object.create(null);
          net.dot1qReq[dev][parent] = net.dot1qReq[dev][parent] || new Set();
          if(isFinite(vlan)) net.dot1qReq[dev][parent].add(vlan);
        }

        const ipm = line.match(/^ip\s+address\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)/i);
        if(ipm){
          st.ip = ipm[1]; st.mask = ipm[2];
        }
      }
    }
  }

  function initNetForLab(lab){
    const net = {
      labId: lab.id,
      ifaces: Object.create(null),
      dot1qReq: Object.create(null),
      linkPortsBuilt: false,
      linkPorts: Object.create(null),
      linkStates: Object.create(null),
    };
    buildLinkPorts(lab, net);
    parseStartingConfigsIntoNet(lab, net);
    computeLinkStates(lab, net);
    return net;
  }

  function getNetForLab(lab){
    if(!lab || !lab.id) return null;
    const reg = window.__ITSDaksNet || (window.__ITSDaksNet = Object.create(null));
    if(!reg[lab.id]) reg[lab.id] = initNetForLab(lab);
    return reg[lab.id];
  }

  function computeLinkStates(lab, net){
    if(!lab || !net) return;
    buildLinkPorts(lab, net);
    net.linkStates = Object.create(null);

    for(const k of Object.keys(net.linkPorts || {})){
      const ln = net.linkPorts[k];
      const a = ln.a, b = ln.b;
      const aIf = ln.aIf, bIf = ln.bIf;
      const aSt = isPcDevice(a) ? { adminUp: true } : (net.ifaces[a] && net.ifaces[a][canonIfShort(aIf)]) || { adminUp: true };
      const bSt = isPcDevice(b) ? { adminUp: true } : (net.ifaces[b] && net.ifaces[b][canonIfShort(bIf)]) || { adminUp: true };

      let state = "ok";

      if((aSt && aSt.adminUp === false) || (bSt && bSt.adminUp === false)){
        state = "danger";
      }

      const lbl = String(ln.label||"").toLowerCase();
      const isTrunk = /\btrunk\b|802\.?1q|dot1q/.test(lbl) || ((aSt && aSt.trunkMode) || (bSt && bSt.trunkMode));
      if(state !== "danger" && isTrunk){
        const aParent = canonIfShort(String(aIf||"").split(".")[0]);
        const bParent = canonIfShort(String(bIf||"").split(".")[0]);

        const reqA = (net.dot1qReq[a] && net.dot1qReq[a][aParent]) ? net.dot1qReq[a][aParent] : null;
        const reqB = (net.dot1qReq[b] && net.dot1qReq[b][bParent]) ? net.dot1qReq[b][bParent] : null;

        const allowA = (aSt && aSt.allowedVlans !== undefined) ? aSt.allowedVlans : null;
        const allowB = (bSt && bSt.allowedVlans !== undefined) ? bSt.allowedVlans : null;

        function reqNotAllowed(reqSet, allowSet){
          if(!reqSet || reqSet.size === 0) return false;
          if(allowSet === null) return false;
          if(!(allowSet instanceof Set)) return false;
          for(const v of reqSet){
            if(!allowSet.has(v)) return true;
          }
          return false;
        }

        if(reqNotAllowed(reqA, allowB) || reqNotAllowed(reqB, allowA)){
          state = "danger";
        }
      }

      net.linkStates[k] = state;
    }
  }

  function dynamicCliOutput(lab, net, modeKey, device, cmdRaw){
    if(!lab || !net) return null;
    const cmd = String(cmdRaw||"").trim();
    const n = normalizeCmd(cmd);

    computeLinkStates(lab, net);

    if(isPcDevice(device) && n.startsWith("ping ")){
      let down = false;
      for(const k of Object.keys(net.linkPorts || {})){
        const ln = net.linkPorts[k];
        if(ln.a === device || ln.b === device){
          if(net.linkStates && net.linkStates[k] === "danger") down = true;
        }
      }
      if(down){
        const ip = cmd.split(/\s+/).slice(1).join(" ").trim() || "0.0.0.0";
        return pingFail(ip, "Link is down.");
      }
      return null;
    }

    if(n === "show ip interface brief" || n === "show ip int brief" || n === "show ip int br"){
      if(isPcDevice(device)) return "% Invalid input detected at '^' marker.\n^";
      const ifs = Object.keys(net.ifaces[device] || {}).sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
      const lines = [];
      lines.push("Interface              IP-Address      OK? Method Status                Protocol");
      for(const ifn of ifs){
        const st = net.ifaces[device][ifn];
        const disp = displayIfName(ifn).padEnd(22);
        const ip = (st.ip ? st.ip : "unassigned").padEnd(15);
        const ok = "YES".padEnd(3);
        const method = (st.ip ? "manual" : "unset").padEnd(6);

        let linkDown = false;
        for(const k of Object.keys(net.linkPorts || {})){
          const ln = net.linkPorts[k];
          const state = net.linkStates ? net.linkStates[k] : "ok";
          if(state !== "danger") continue;
          if((ln.a === device && (canonIfShort(ln.aIf) === canonIfShort(ifn) || canonIfShort(ln.aIf) === canonIfShort(ifn.split('.')[0]))) ||
             (ln.b === device && (canonIfShort(ln.bIf) === canonIfShort(ifn) || canonIfShort(ln.bIf) === canonIfShort(ifn.split('.')[0])))){
            linkDown = true;
          }
        }

        let status = "up";
        let proto = "up";
        if(st.adminUp === false){
          status = "administratively down";
          proto = "down";
        }else if(linkDown){
          status = "down";
          proto = "down";
        }
        lines.push(`${disp} ${ip} ${ok} ${method} ${status.padEnd(20)} ${proto}`);
      }
      return lines.join("\n");
    }


    if(n === "show vlan brief" || n === "show vlan br"){
      if(isPcDevice(device)) return "% Invalid input detected at '^' marker.\n^";
      if(!isSwitchDevice(device)) return "% Invalid input detected at '^' marker.\n^";

      const vlans = new Set([1]);
      // infer VLANs from trunk allow lists + dot1q requirements
      for(const ifn of Object.keys(net.ifaces[device] || {})){
        const st = net.ifaces[device][ifn];
        if(st.allowedVlans instanceof Set){
          for(const v of st.allowedVlans) vlans.add(v);
        }
      }
      // also include any router dot1q VLANs in the lab (useful for RoAS)
      for(const dev of Object.keys(net.dot1qReq || {})){
        const mp = net.dot1qReq[dev] || {};
        for(const p of Object.keys(mp)){
          for(const v of (mp[p]||[])) vlans.add(v);
        }
      }

      const rows = Array.from(vlans).sort((a,b)=>a-b).map(v => {
        const name = (v === 1) ? "default" : `VLAN${String(v).padStart(4,'0')}`;
        return `${String(v).padEnd(4)} ${name.padEnd(32)} active`;
      });

      return ["VLAN Name                             Status",
              "---- -------------------------------- --------",
              ...rows].join("\n");
    }

    if(n === "show interfaces trunk" || n === "show int trunk" || n === "show interface trunk"){
      if(isPcDevice(device)) return "% Invalid input detected at '^' marker.\n^";
      if(!isSwitchDevice(device)){
        return "% Invalid input detected at '^' marker.\n^";
      }
      const ifs = Object.keys(net.ifaces[device] || {}).filter(i => net.ifaces[device][i].trunkMode).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
      if(ifs.length === 0){
        return "Port        Mode         Encapsulation  Status        Native vlan\n\n(no trunk ports)";
      }
      const head = [];
      head.push("Port        Mode         Encapsulation  Status        Native vlan");
      for(const ifn of ifs){
        const st = net.ifaces[device][ifn];
        let linkDown = false;
        for(const k of Object.keys(net.linkPorts || {})){
          const ln = net.linkPorts[k];
          if(ln.a === device && canonIfShort(ln.aIf) === canonIfShort(ifn) && net.linkStates[k] === "danger") linkDown = true;
          if(ln.b === device && canonIfShort(ln.bIf) === canonIfShort(ifn) && net.linkStates[k] === "danger") linkDown = true;
        }
        const status = (!st.adminUp || linkDown) ? "down" : "trunking";
        head.push(`${displayIfName(ifn).replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").padEnd(11)} on           802.1q         ${status.padEnd(12)} 1`);
      }
      head.push("");
      head.push("Port        Vlans allowed on trunk");
      for(const ifn of ifs){
        const st = net.ifaces[device][ifn];
        const vl = (st.allowedVlans === null) ? "all" : Array.from(st.allowedVlans).sort((a,b)=>a-b).join(",");
        head.push(`${displayIfName(ifn).replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").padEnd(11)} ${vl}`);
      }
      return head.join("\n");
    }

    return null;
  }

  function dispatchNetEvent(labId){
    try{
      window.dispatchEvent(new CustomEvent('itsdaks:net', { detail: { labId } }));
    }catch(_e){}
  }



  function pingOk(ip){
    return `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${ip}, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 2/4/7 ms`;
  }
  function pingFail(ip, hint){
    return `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${ip}, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)
${hint ? ("\nHint: " + hint) : ""}`;
  }

  function byId(id){ return document.getElementById(id); }
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function setActiveNav(route){
    const btns = qsa(".nav-btn");
    btns.forEach(b => b.classList.remove("active"));
    if(route.startsWith("track/CCNA")) byId("navCCNA").classList.add("active");
    else if(route.startsWith("track/CCNP")) byId("navCCNP").classList.add("active");
    else if(route.startsWith("about")) byId("navAbout").classList.add("active");
    else byId("navHome").classList.add("active");
  }

  function setToolbar(route, title){
    byId("routePill").textContent = route;
    byId("toolbarTitle").textContent = title;
  }

  function routeToHash(route){
    location.hash = "#" + route;
  }

  function getRouteFromHash(){
    const h = (location.hash || "#home").slice(1);
    return h || "home";
  }

  function filterLabs({track=null, q="", difficulty=""}){
    const query = q.trim().toLowerCase();
    return LABS.filter(lab => {
      if(track && lab.track !== track) return false;
      if(difficulty && lab.difficulty !== difficulty) return false;
      if(!query) return true;
      const hay = [
        lab.title, lab.summary, lab.track, lab.difficulty,
        ...(lab.tags||[]), ...(lab.objectives||[])
      ].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }

  function formatMinutes(m){
    return m ? `${m} min` : "";
  }

  /* ---------------------------
     Rendering: Home / List
     --------------------------- */

  function renderLabList(route, labs){
    const view = byId("view");
    view.innerHTML = `
      <div class="grid">
        ${labs.map(lab => renderLabCard(lab)).join("")}
      </div>
    `;

    // bind "Open lab"
    qsa("[data-open-lab]").forEach(btn => {
      btn.addEventListener("click", () => {
        routeToHash("lab/" + btn.getAttribute("data-open-lab"));
      });
    });
  }

  function renderLabCard(lab){
    const badgeTrack = lab.track === "CCNA" ? "accent" : "purple";
    const badgeDiff = lab.difficulty === "Beginner" ? "ok"
                    : lab.difficulty === "Intermediate" ? "warn"
                    : "warn";
    return `
      <article class="card">
        <div class="card-hd">
          <div>
            <h3 class="card-title">${escapeHtml(lab.title)}</h3>
            <div class="card-sub">${escapeHtml(lab.summary)}</div>
            <div style="margin-top:10px" class="badges">
              <span class="badge ${badgeTrack}">${escapeHtml(lab.track)}</span>
              <span class="badge ${badgeDiff}">${escapeHtml(lab.difficulty)}</span>
              <span class="badge">${escapeHtml(formatMinutes(lab.minutes))}</span>
            </div>
          </div>
        </div>
        <div class="card-bd small">
          <div class="muted">Topics:</div>
          <div style="margin-top:6px" class="badges">
            ${(lab.tags||[]).slice(0,8).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
        <div class="card-actions">
          <button class="btn primary" data-open-lab="${escapeHtml(lab.id)}">Open lab →</button>
        </div>
      </article>
    `;
  }

  /* ---------------------------
     Rendering: Lab page
     --------------------------- */

  function renderLab(lab){
    const view = byId("view");
    if(!lab){
      view.innerHTML = `<div class="panel"><div class="panel-bd">Lab not found.</div></div>`;
      return;
    }

    view.innerHTML = `
      <div class="panel">
        <div class="panel-hd">
          <div>
            <h2 class="panel-title" style="margin:0;">${escapeHtml(lab.title)}</h2>
            <div class="panel-sub">
              <span class="badge ${lab.track==="CCNA" ? "accent":"purple"}">${escapeHtml(lab.track)}</span>
              <span class="badge warn">${escapeHtml(lab.difficulty)}</span>
              <span class="badge">${escapeHtml(formatMinutes(lab.minutes))}</span>
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button class="btn" id="backBtn">← Back to labs</button>
            <button class="btn" id="shareBtn" title="Copy link to this lab">Copy link</button>
          </div>
        </div>

        <div class="tabs" role="tablist" aria-label="Lab tabs">
          <button class="tab active" data-tab="problem">Problem</button>
          <button class="tab" data-tab="topology">Topology</button>
          <button class="tab" data-tab="console">Console</button>
          <button class="tab" data-tab="configs">Starting Configs</button>
          <button class="tab" data-tab="solution">Solution</button>
        </div>

        <div class="panel-bd" id="tabBody"></div>
      </div>
    `;

    byId("backBtn").addEventListener("click", () => {
      // go back to track route if possible
      const r = lastListRoute || "home";
      routeToHash(r);
    });

    byId("shareBtn").addEventListener("click", async () => {
      const url = location.href;
      try{
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }catch(e){
        toast("Could not copy (browser blocked clipboard)");
      }
    });

    // tabs
    const tabBody = byId("tabBody");
    const tabs = qsa(".tab");
    let solutionUnlocked = false;

    function setTab(name){
      tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === name));

      if(name === "problem"){
        tabBody.innerHTML = lab.problemHtml;
        renderObjectives(lab, tabBody);
      } else if(name === "topology"){
        tabBody.innerHTML = renderTopologyTab(lab);
        bindTopologyInteractions(lab, tabBody);
      } else if(name === "console"){
        tabBody.innerHTML = renderConsoleTab(lab);
        bindConsole(lab, tabBody);
      } else if(name === "configs"){
        tabBody.innerHTML = renderConfigsTab(lab);
        bindCopyButtons(tabBody);
      } else if(name === "solution"){
        if(!solutionUnlocked){
          tabBody.innerHTML = renderSolutionLock();
          qs("#unlockSolution", tabBody).addEventListener("click", () => {
            solutionUnlocked = true;
            setTab("solution");
          });
        } else {
          tabBody.innerHTML = lab.solutionHtml;
          bindCopyButtons(tabBody);
        }
      }
    }

    tabs.forEach(t => t.addEventListener("click", () => setTab(t.getAttribute("data-tab"))));
    setTab("problem");
  }

  function renderObjectives(lab, root){
    const el = document.createElement("div");
    el.innerHTML = `
      <hr class="sep" />
      <h3 style="margin:0 0 6px 0;">Lab objectives</h3>
      <ul class="clean">
        ${(lab.objectives||[]).map(o => `<li>${escapeHtml(o)}</li>`).join("")}
      </ul>
    `;
    root.appendChild(el);
  }

  function renderSolutionLock(){
    return `
      <div class="notice warn small">
        <b>Solution is hidden</b> to keep this realistic.
        Try troubleshooting first using the Console and Topology tabs.
      </div>
      <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn primary" id="unlockSolution">Reveal solution</button>
        <div class="muted small">Tip: Switch Console mode between “Broken” and “Fixed” after you reveal.</div>
      </div>
    `;
  }

  /* ---------------------------
     Topology (SVG)
     --------------------------- */

  function renderTopologyTab(lab){
    const svg = buildTopologySvg(lab.topology);
    return `
      <div class="split">
        <div>
          <div class="notice small">
            Click a device in the diagram to see its role and key IPs.
          </div>
          <div style="margin-top:12px;">
            ${svg}
          </div>
        </div>

        <div>
          <div class="panel" style="margin-bottom:14px;">
            <div class="panel-hd">
              <div>
                <h3 class="panel-title">Device details</h3>
                <div class="panel-sub">Select a node on the left.</div>
              </div>
            </div>
            <div class="panel-bd" id="deviceDetails">
              <div class="muted">No device selected.</div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-hd">
              <div>
                <h3 class="panel-title">Links</h3>
                <div class="panel-sub">Physical/logical connections in this lab.</div>
              </div>
            </div>
            <div class="panel-bd">
              <table class="table">
                <thead><tr><th>Endpoint A</th><th>Endpoint B</th><th>Notes</th></tr></thead>
                <tbody>
                  ${lab.topology.links.map(l => `
                    <tr>
                      <td><span class="kbd">${escapeHtml(l.a)}</span></td>
                      <td><span class="kbd">${escapeHtml(l.b)}</span></td>
                      <td class="muted">${escapeHtml(l.label||"")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildTopologySvg(topology){
    const w = 420, h = 380;
    const nodes = topology.nodes;
    const links = topology.links;

    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

    function linkKey(a,b){
      const x = String(a), y = String(b);
      return (x < y) ? `${x}--${y}` : `${y}--${x}`;
    }

    return `
      <svg class="topology" viewBox="0 0 ${w} ${h}" role="img" aria-label="Network topology diagram">
        <defs>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(0,0,0,0.45)"/>
          </filter>
        </defs>

        ${links.map(l => {
          const a = nodeById[l.a], b = nodeById[l.b];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const k = linkKey(l.a, l.b);
          return `
            <g class="link" data-link="${escapeHtml(k)}">
              <line class="link-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />
              <circle class="link-led led warn blink" cx="${mx}" cy="${my}" r="5" />
            </g>
          `;
        }).join("")}

        ${nodes.map(n => {
          const lines = String(n.label).split("\n");
          const x0 = n.x-58, y0 = n.y-30;
          return `
            <g class="node" data-node="${escapeHtml(n.id)}" style="cursor:pointer;">
              <rect class="node-box" x="${x0}" y="${y0}" width="116" height="60" rx="12" filter="url(#shadow)"></rect>
              <circle class="node-led led warn blink" cx="${x0+106}" cy="${y0+12}" r="6" />
              <text class="node-label" x="${n.x}" y="${n.y-6}" text-anchor="middle">
                ${lines[0] ? escapeHtml(lines[0]) : ""}
              </text>
              <text class="node-label" x="${n.x}" y="${n.y+12}" text-anchor="middle" opacity="0.9">
                ${lines[1] ? escapeHtml(lines[1]) : ""}
              </text>
            </g>
          `;
        }).join("")}
      </svg>
    `;
  }


  
  // ---------------------------
  // Topology LEDs (device/link indicators)
  // - Red blink: earliest failing devices/links (no stages unlocked yet)
  // - Amber blink: still pending stages (partial fixes)
  // - Green: fixed / not implicated
  // ---------------------------

  function getSimForLab(labId){
    const reg = window.__ITSDaksSim || (window.__ITSDaksSim = Object.create(null));
    return reg[labId] || null;
  }

  function setLedClass(el, state){
    if(!el) return;
    el.classList.remove('ok','warn','danger','blink');
    if(state === 'ok') el.classList.add('ok');
    else if(state === 'danger') el.classList.add('danger','blink');
    else el.classList.add('warn','blink');
  }

  function setLinkLineClass(el, state){
    if(!el) return;
    el.classList.remove('ok','warn','danger','blink');
    if(state === 'ok') el.classList.add('ok');
    else if(state === 'danger') el.classList.add('danger','blink');
    else el.classList.add('warn','blink');
  }

  function applyTopologyIndicators(lab, root){
    const svg = qs('svg.topology', root);
    if(!svg) return;

    // Ensure we have a sim object even if the Console tab hasn't been opened yet.
    // This lets the topology show 'down / degraded' indicators immediately.
    let sim = getSimForLab(lab.id);
    if(!sim){
      sim = { activeStageIds: [], stageCount: 0, stages: [] };
      try{
        const html = String(lab.solutionHtml || '');
        const strip = (s) => String(s||'').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const codeRe = /<code id=\"([^\"]+)\">([\s\S]*?)<\/code>/g;
        const headRe = /<(h3|h4)[^>]*>([\s\S]*?)<\/(h3|h4)>/ig;
        const heads = [];
        let hm;
        while((hm = headRe.exec(html))){
          heads.push({ idx: hm.index, text: strip(hm[2]) });
        }
        let cm;
        while((cm = codeRe.exec(html))){
          const at = cm.index;
          let heading = null;
          for(let i=heads.length-1;i>=0;i--){
            if(heads[i].idx < at){ heading = heads[i]; break; }
          }
          let dev = '';
          if(heading){
            const m = heading.text.match(/\(([^)]+)\)\s*$/);
            if(m) dev = m[1].trim();
          }
          sim.stages.push({ id: 'pre-' + cm[1], title: heading ? heading.text : cm[1], requires: dev ? [{ device: dev, cmds: [] }] : [] });
        }
        sim.stageCount = sim.stages.length;
      }catch(_e){}
      window.__ITSDaksSim = window.__ITSDaksSim || Object.create(null);
      window.__ITSDaksSim[lab.id] = sim;
    }
    const stages = (sim && Array.isArray(sim.stages)) ? sim.stages : [];
    const unlocked = (sim && Array.isArray(sim.activeStageIds)) ? new Set(sim.activeStageIds) : new Set();

    // Determine per-device pending/failing state from stage requirements.
    const reqByDev = Object.create(null);
    for(const st of stages){
      const reqs = Array.isArray(st.requires) ? st.requires : [];
      for(const r of reqs){
        if(!r || !r.device) continue;
        reqByDev[r.device] = reqByDev[r.device] || [];
        reqByDev[r.device].push(st.id);
      }
    }

    const anyUnlocked = unlocked.size > 0;
    const allUnlocked = stages.length > 0 && unlocked.size === stages.length;

    const nodeEls = qsa('.node', svg);
    nodeEls.forEach(g => {
      const id = g.getAttribute('data-node');
      const led = qs('.node-led', g);
      if(allUnlocked){
        setLedClass(led, 'ok');
        return;
      }
      const implicated = !!reqByDev[id];
      if(!implicated){
        // Not part of fix steps; keep as ok unless lab is totally broken.
        setLedClass(led, anyUnlocked ? 'ok' : 'warn');
        return;
      }
      const neededStages = reqByDev[id] || [];
      const stillPending = neededStages.some(sid => !unlocked.has(sid));
      if(!anyUnlocked && stillPending){
        setLedClass(led, 'danger');
      } else if(stillPending){
        setLedClass(led, 'warn');
      } else {
        setLedClass(led, 'ok');
      }
    });

    // Link state based on endpoint node LEDs.
    function linkKey(a,b){
      const x = String(a), y = String(b);
      return (x < y) ? `${x}--${y}` : `${y}--${x}`;
    }

    const linkGroups = qsa('g.link', svg);
    linkGroups.forEach(g => {
      const k = g.getAttribute('data-link');
      // Map k back to endpoints
      const parts = String(k||'').split('--');
      const a = parts[0], b = parts[1];
      const aLed = qs(`.node[data-node="${CSS.escape(a)}"] .node-led`, svg);
      const bLed = qs(`.node[data-node="${CSS.escape(b)}"] .node-led`, svg);

      const aDanger = aLed && aLed.classList.contains('danger');
      const bDanger = bLed && bLed.classList.contains('danger');
      const aWarn = aLed && aLed.classList.contains('warn');
      const bWarn = bLed && bLed.classList.contains('warn');

      const line = qs('line.link-line', g);
      const led = qs('circle.link-led', g);

      let state = 'ok';
      if(aDanger || bDanger) state = 'danger';
      else if(aWarn || bWarn) state = 'warn';

      setLinkLineClass(line, state);
      setLedClass(led, state);
    });
  }

function bindTopologyInteractions(lab, root){
    const details = qs("#deviceDetails", root);
    const nodeEls = qsa(".node", root);

    function setActiveNode(id){
      nodeEls.forEach(g => {
        const rect = qs("rect", g);
        rect.classList.toggle("active", g.getAttribute("data-node") === id);
      });

      details.innerHTML = renderDeviceDetails(lab, id);
      bindCopyButtons(details);
    }

    nodeEls.forEach(g => {
      g.addEventListener("click", () => setActiveNode(g.getAttribute("data-node")));
    });


    // initial LED state
    applyTopologyIndicators(lab, root);

    // update LEDs when console progress changes
    if(root._topoProgressHandler){
      window.removeEventListener('itsdaks:progress', root._topoProgressHandler);
    }
    root._topoProgressHandler = (ev) => {
      if(!ev || !ev.detail || ev.detail.labId !== lab.id) return;
      applyTopologyIndicators(lab, root);
    };
    window.addEventListener('itsdaks:progress', root._topoProgressHandler);
    window.addEventListener('itsdaks:net', root._topoProgressHandler);
  }

  function renderDeviceDetails(lab, nodeId){
    // Keep this small and “real-world-ish”
    const map = {
      "R1": `
        <div class="notice small">
          <b>R1 (Branch router)</b><br/>
          • G0/0 = trunk to SW1 (subinterfaces .10 / .20)<br/>
          • G0/1 = WAN to ISP (NAT outside)<br/>
          • DHCP for VLAN 10 and 20
        </div>
        <div class="muted small" style="margin-top:10px;">
          Try: <span class="kbd">show ip int brief</span>, <span class="kbd">show access-lists</span>, <span class="kbd">show ip dhcp binding</span>
        </div>
      `,
      "SW1": `
        <div class="notice small">
          <b>SW1 (Access switch)</b><br/>
          • G0/1 uplink should carry VLAN 10 and VLAN 20<br/>
          • Access ports: Fa0/10 (Staff), Fa0/11 (File server), Fa0/20 (Guest/AP)
        </div>
        <div class="muted small" style="margin-top:10px;">
          Try: <span class="kbd">show interfaces trunk</span>, <span class="kbd">show vlan brief</span>
        </div>
      `,
      "ISP": `
        <div class="notice small">
          <b>ISP (simulated)</b><br/>
          • Only used to test NAT/internet reachability<br/>
          • Default route on R1 points to 203.0.113.1
        </div>
      `,
      "PC-STAFF": `
        <div class="notice small">
          <b>PC-STAFF</b><br/>
          • Expected: 10.10.10.10/24, GW 10.10.10.1<br/>
          • Must reach file server + internet
        </div>
      `,
      "PC-GUEST": `
        <div class="notice small">
          <b>PC-GUEST</b><br/>
          • Expected: 10.10.20.10/24, GW 10.10.20.1<br/>
          • Internet only (no staff VLAN access)
        </div>
      `,
      "SRV-FILE": `
        <div class="notice small">
          <b>SRV-FILE</b><br/>
          • 10.10.10.50/24 in VLAN 10<br/>
          • Guest VLAN must not reach this host
        </div>
      `,
      "CORE": `
        <div class="notice small">
          <b>CORE</b><br/>
          • OSPF Area 0 hub for campus + branch<br/>
          • MD5 auth on uplinks to DIST1 & DIST2
        </div>
        <div class="muted small" style="margin-top:10px;">
          Try: <span class="kbd">show ip ospf neighbor</span>, <span class="kbd">show ip route</span>
        </div>
      `,
      "DIST1": `
        <div class="notice small">
          <b>DIST1</b><br/>
          • ABR (Area 0 ↔ Area 10)<br/>
          • HSRP active for VLAN110 (10.110.0.1)
        </div>
        <div class="muted small" style="margin-top:10px;">
          Try: <span class="kbd">show standby brief</span>, <span class="kbd">show ip ospf neighbor</span>
        </div>
      `,
      "DIST2": `
        <div class="notice small">
          <b>DIST2</b><br/>
          • ABR (Area 0 ↔ Area 10)<br/>
          • HSRP active for VLAN120 (10.120.0.1)
        </div>
        <div class="muted small" style="margin-top:10px;">
          Try: <span class="kbd">show ip ospf neighbor</span>, <span class="kbd">show ip route 172.16.50.0</span>
        </div>
      `,
      "BR1": `
        <div class="notice small">
          <b>BR1 (Branch router)</b><br/>
          • Advertises branch LAN 172.16.50.0/24 into OSPF area 0
        </div>
      `,
      "PC110": `
        <div class="notice small">
          <b>PC-VLAN110</b><br/>
          • 10.110.0.10/24, gateway 10.110.0.1
        </div>
      `,
      "PC120": `
        <div class="notice small">
          <b>PC-VLAN120</b><br/>
          • 10.120.0.10/24, gateway 10.120.0.1
        </div>
      `
    };

    return map[nodeId] || `<div class="muted">No details available.</div>`;
  }

  /* ---------------------------
     Console tab
     --------------------------- */

  function renderConsoleTab(lab){
    const devices = lab.cli?.devices || [];
    const modes = lab.cli?.modes || ["Broken","Fixed"];

    return `
      <div class="console-wrap">
        <div class="notice small">
          <b>How to use:</b> Choose a device, choose a mode (<span class="kbd">Broken</span> or <span class="kbd">Fixed</span>),
          then run commands like <span class="kbd">show ip ospf neighbor</span> or <span class="kbd">ping 8.8.8.8</span>.
          <div class="muted" style="margin-top:6px;">Type <span class="kbd">help</span> to see supported commands for the selected device.</div>
        </div>

        <div class="console-bar">
          <label class="muted small">Device
            <select class="select" id="cliDevice">
              ${devices.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("")}
            </select>
          </label>

          <label class="muted small">Mode
            <select class="select" id="cliMode">
              ${modes.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("")}
            </select>
          </label>

          <button class="btn" id="cliClear">Clear</button>
        </div>

        <div class="console">
          <div class="console-output" id="cliOut"></div>
          <div class="console-input-row">
            <div class="prompt" id="cliPrompt">R1#</div>
            <input class="console-input" id="cliIn" placeholder="Type a command (e.g., help, show ip int brief, ping 8.8.8.8)" />
            <button class="btn primary" id="cliSend">Run</button>
          </div>
        </div>

        <div class="muted small">
          This is a learning simulation (not a full IOS emulator). For full practice, paste the configs into Packet Tracer / CML / GNS3.
        </div>
      </div>
    `;
  }

  function bindConsole(lab, root){
    const deviceSel = qs("#cliDevice", root);
    const modeSel = qs("#cliMode", root);
    const outEl = qs("#cliOut", root);
    const inEl = qs("#cliIn", root);
    const promptEl = qs("#cliPrompt", root);
    const runBtn = qs("#cliSend", root);
    const clearBtn = qs("#cliClear", root);

    // IOS-ish prompt context per device (lightweight)
    const ctxByDevice = Object.create(null);
    const net = getNetForLab(lab);


    // ---------------------------
    // Packet Tracer-ish command UX
    // ---------------------------

    const hist = [];
    let histIdx = -1;

    function rawTokens(s){
      return String(s||'').trim().split(/\s+/).filter(Boolean);
    }

    function looksLikeLiteral(tok){
      return /[0-9]/.test(tok) || tok.includes('.') || tok.includes('/') || tok.includes(':');
    }

    function canonIfName(t){
      let x = String(t||'').toLowerCase();
      x = x.replace(/^tengigabitethernet/, 'te');
      x = x.replace(/^gigabitethernet/, 'gi');
      x = x.replace(/^fastethernet/, 'fa');
      // Normalize gi0/1 -> g0/1 style used in many labs
      x = x.replace(/^gi(?=\d)/, 'g');
      x = x.replace(/^fa(?=\d)/, 'f');
      x = x.replace(/^te(?=\d)/, 't');
      return x;
    }

    function canonFixLineVariants(cmd){
      const out = new Set();
      let n = normFixLine(cmd);
      if(!n) return [];

      // common shorthands
      if(n === 'wr') out.add('wr mem');
      if(n === 'write') out.add('write memory');
      if(n === 'conf t') out.add('configure terminal');
      if(n === 'no shut') out.add('no shutdown');
      if(n === 'shut') out.add('shutdown');

      // int -> interface
      if(n.startsWith('int ')) out.add('interface ' + n.slice(4));
      if(n.startsWith('inter ')) out.add('interface ' + n.slice(6));

      // ip add -> ip address
      if(n.startsWith('ip add ')) out.add('ip address ' + n.slice(7));

      out.add(n);

      // interface token normalization inside interface commands
      const extra = new Set();
      for(const v of out){
        if(v.startsWith('interface ')){
          const parts = v.split(/\s+/);
          if(parts[1]){
            const ci = canonIfName(parts[1]);
            extra.add('interface ' + ci);
          }
        }
      }
      for(const v of extra) out.add(v);

      return Array.from(out);
    }

    function iosCaret(cmd){
      // Best-effort: caret at beginning
      return String(cmd||'') + "\n^";
    }

    function iosError(cmd, kind){
      if(kind === 'incomplete') return '% Incomplete command.';
      if(kind === 'ambiguous') return '% Ambiguous command.';
      return iosCaret(cmd) + "\n% Invalid input detected at '^' marker.";
    }

    function listKnownCommands(device){
      const out = [];
      const addFrom = (modeKey) => {
        const hs = lab.cli && lab.cli[modeKey] && lab.cli[modeKey][device] ? lab.cli[modeKey][device] : [];
        for(const h of hs){
          if(typeof h.match === 'string') out.push(h.match);
        }
      };
      addFrom('broken');
      addFrom('fixed');
      // add some generic exec/config staples
      out.push('help', '?', 'conf t', 'configure terminal', 'end', 'exit', 'wr mem', 'write memory');

      // common show commands (dynamic)
      out.push('show ip interface brief', 'show interfaces trunk', 'show vlan brief');
      return Array.from(new Set(out.map(s => String(s||'').trim()).filter(Boolean)));
    }

    function tokenizeForMatch(s){
      return rawTokens(String(s||'').toLowerCase()).map(t => {
        if(t === 'int') return 'interface';
        if(t === 'sh') return 'show';
        if(t === 'conf') return 'configure';
        if(t === 'wr') return 'write';
        return t;
      });
    }

    function tokenPrefixMatch(inputTok, targetTok){
      const a = String(inputTok||'').toLowerCase();
      const b = String(targetTok||'').toLowerCase();
            return b.startsWith(a);
    }



    function resolveCommand(device, cmdRaw){
      const cmd = String(cmdRaw||'').trim();
      if(!cmd) return { kind: 'noop' };

      // Support '?' help
      if(cmd === '?') return { kind: 'help', prefix: '' };

      // Trailing ? (e.g., "show ip ?")
      const endsWithQ = /\?\s*$/.test(cmd);
      if(endsWithQ && cmd !== '?'){
        const prefix = cmd.replace(/\?\s*$/, '').trimEnd();
        return { kind: 'help', prefix };
      }

      // Exact handler match first
      const modeKey = (modeSel.value || 'Broken').toLowerCase();
      const direct = handlerOutput(modeKey, device, cmd);
      if(direct != null) return { kind: 'out', out: direct, matched: cmd };

      // Abbreviation matching among known commands
      const known = listKnownCommands(device).filter(x => x !== '?' && x !== 'help');
      const inputToks = tokenizeForMatch(cmd);

      const candidates = [];
      for(const k of known){
        const ktoks = tokenizeForMatch(k);
        if(inputToks.length > ktoks.length) continue;
        let ok = true;
        for(let i=0;i<inputToks.length;i++){
          if(!tokenPrefixMatch(inputToks[i], ktoks[i])){ ok = false; break; }
        }
        if(ok) candidates.push({ full: k, toks: ktoks });
      }

      // Prefer same token length candidates
      const exactLen = candidates.filter(c => c.toks.length === inputToks.length);
      if(exactLen.length === 1){
        const out = handlerOutput(modeKey, device, exactLen[0].full);
        if(out != null) return { kind: 'out', out, matched: exactLen[0].full };
        // fallback to other mode if not present
        const alt = handlerOutput(modeKey === 'broken' ? 'fixed' : 'broken', device, exactLen[0].full);
        if(alt != null) return { kind: 'out', out: alt, matched: exactLen[0].full };
        return { kind: 'invalid' };
      }
      if(exactLen.length > 1){
        return { kind: 'ambiguous', options: exactLen.map(x => x.full) };
      }

      if(candidates.length === 1){
        // User hasn't provided enough tokens
        return { kind: 'incomplete', closest: candidates[0].full };
      
    // ---------------------------
    // Physical link state override
    // (admin shut/no shut, trunk VLAN mismatches)
    // ---------------------------
    const net = getNetForLab(lab);
    if(net){
      computeLinkStates(lab, net);

      const nodeMax = Object.create(null);

      // Base severity from existing node LED classes (stage-based)
      qsa('g.node', svg).forEach(g => {
        const id = g.getAttribute('data-node');
        const led = qs('.node-led', g);
        let lvl = 0;
        if(led && led.classList.contains('danger')) lvl = 2;
        else if(led && led.classList.contains('warn')) lvl = 1;
        nodeMax[id] = Math.max(nodeMax[id]||0, lvl);
      });

      const linkGroups2 = qsa('g.link', svg);
      linkGroups2.forEach(g => {
        const k = g.getAttribute('data-link');
        const st = net.linkStates ? net.linkStates[k] : null;
        if(!st) return;
        const line = qs('line.link-line', g);
        const led = qs('circle.link-led', g);
        setLinkLineClass(line, st);
        setLedClass(led, st);

        const parts = String(k||'').split('--');
        const a = parts[0], b = parts[1];
        const lvl = (st === 'danger') ? 2 : (st === 'warn' ? 1 : 0);
        nodeMax[a] = Math.max(nodeMax[a]||0, lvl);
        nodeMax[b] = Math.max(nodeMax[b]||0, lvl);
      });

      // Apply merged severity to node LEDs
      qsa('g.node', svg).forEach(g => {
        const id = g.getAttribute('data-node');
        const led = qs('.node-led', g);
        const lvl = nodeMax[id] || 0;
        if(lvl >= 2) setLedClass(led, 'danger');
        else if(lvl === 1) setLedClass(led, 'warn');
        else setLedClass(led, 'ok');
      });
    }

}
      if(candidates.length > 1){
        return { kind: 'ambiguous', options: candidates.map(x => x.full) };
      }

      return { kind: 'invalid' };
    }

    function showHelp(device, prefix){
      const known = listKnownCommands(device);
      const p = String(prefix||'').trim();
      if(!p){
        append('Exec commands:');
        append('  show  ping  traceroute  help');
        if(!device.startsWith('PC')){
          append('Config (accepted):');
          append('  conf t  interface  router  ip  no  end  exit  wr mem');
        }
        append('');
        return;
      }

      const pToks = tokenizeForMatch(p);
      const next = new Set();
      for(const k of known){
        const ktoks = tokenizeForMatch(k);
        if(pToks.length > ktoks.length) continue;
        let ok = true;
        for(let i=0;i<pToks.length;i++){
          if(!tokenPrefixMatch(pToks[i], ktoks[i])){ ok = false; break; }
        }
        if(!ok) continue;
        if(ktoks.length === pToks.length) continue;
        next.add(ktoks[pToks.length]);
      }

      const arr = Array.from(next).sort();
      if(arr.length === 0){
        append('% No further help.');
        append('');
        return;
      }
      append('Possible completions:');
      for(const t of arr.slice(0, 40)) append('  ' + t);
      if(arr.length > 40) append(`  ... (${arr.length-40} more)`);
      append('');
    }

    function tabComplete(device, current){
      const v = String(current||'');
      const endsWithSpace = /\s$/.test(v);
      const trimmed = v.trimEnd();
      if(!trimmed) return { value: v, show: true };

      const toks = rawTokens(trimmed);
      let prefixToks = toks.slice();
      let partial = '';
      if(!endsWithSpace){
        partial = prefixToks.pop() || '';
      }
      const p = prefixToks.join(' ');
      const known = listKnownCommands(device);

      const pToks = tokenizeForMatch(p);
      const candNext = new Set();
      for(const k of known){
        const ktoks = tokenizeForMatch(k);
        if(pToks.length > ktoks.length) continue;
        let ok = true;
        for(let i=0;i<pToks.length;i++){
          if(!tokenPrefixMatch(pToks[i], ktoks[i])){ ok = false; break; }
        }
        if(!ok) continue;
        const nextTok = ktoks[pToks.length];
        if(!nextTok) continue;
        if(partial){
          if(nextTok.startsWith(partial.toLowerCase())) candNext.add(nextTok);
        } else {
          candNext.add(nextTok);
        }
      }

      const opts = Array.from(candNext).sort();
      if(opts.length === 0) return { value: v };
      if(opts.length === 1){
        const nt = opts[0];
        const newVal = (p ? p + ' ' : '') + nt + ' ';
        return { value: newVal };
      }

      // extend to common prefix
      let cp = opts[0];
      for(const o of opts.slice(1)){
        let i=0;
              }
      return { value: v, options: opts };
    }

    // --- Progress metadata engine (cli.progress) ---
    function normFixLine(line){
      return String(line || "").trim().replace(/\s+/g, " ").toLowerCase();
    }
    function isGenericFixLine(n){
      if(!n) return true;
      if(n === "conf t" || n === "configure terminal") return true;
      if(n === "end" || n === "exit") return true;
      if(n === "wr mem" || n === "write mem" || n === "write memory") return true;
      if(n.startsWith("!")) return true;
      return false;
    }
    function parseSolutionSteps(solutionHtml){
      const steps = Object.create(null);
      const re = /<code id="([^"]+)">([\s\S]*?)<\/code>/g;
      let m;
      while((m = re.exec(solutionHtml || ""))){
        const stepId = m[1];
        const raw = m[2];
        const lines = raw
          .split(/\r?\n/)
          .map(normFixLine)
          .filter(l => l && !isGenericFixLine(l));
        steps[stepId] = lines;
      }
      return steps;
    }

    const stepMap = parseSolutionSteps(lab.solutionHtml);
    const progressMeta = (lab.cli && lab.cli.progress) ? lab.cli.progress : null;

    // Auto-generate cli.progress (stages + effects) when a lab doesn't define it.
    // This enables progressive fixes across a full lab library without hand-coding overrides.
    function stripTags(html){
      return String(html || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function guessStepTitleAndDevice(stepId){
      const html = String(lab.solutionHtml || "");
      const i = html.indexOf(`id="${stepId}"`);
      if(i < 0) return { title: stepId, device: "" };

      // Look backwards for the nearest heading.
      const headRe = /<(h3|h4)[^>]*>([\s\S]*?)<\/(h3|h4)>/ig;
      let m;
      let best = null;
      while((m = headRe.exec(html))){
        const end = headRe.lastIndex;
        if(end < i) best = m;
        else break;
      }

      const headingText = best ? stripTags(best[2]) : stepId;
      let dev = "";
      const devMatch = headingText.match(/\(([^)]+)\)\s*$/);
      if(devMatch) dev = devMatch[1].trim();

      return { title: headingText || stepId, device: dev };
    }

    function stageCatsFromLines(lines, title){
      const s = (lines || []).join(" ") + " " + String(title || "");
      const x = s.toLowerCase();
      const cats = new Set();
      if(/switchport\s+trunk|allowed\s+vlan|\btrunk\b/.test(x)) cats.add("trunk");
      if(/\bdhcp\b|helper-address/.test(x)) cats.add("dhcp");
      if(/ip\s+nat|\bnat\b/.test(x)) cats.add("nat");
      if(/access-group|access-list|\bacl\b|deny\b|permit\b|access-class|line\s+vty/.test(x)) cats.add("acl");
      if(/router\s+ospf|ip\s+ospf|\bospf\b/.test(x)) cats.add("ospf");
      if(/router\s+eigrp|\beigrp\b/.test(x)) cats.add("eigrp");
      if(/router\s+bgp|\bbgp\b/.test(x)) cats.add("bgp");
      if(/\bstandby\b|\bhsrp\b/.test(x)) cats.add("hsrp");
      if(/channel-group|etherchannel|port-channel/.test(x)) cats.add("etherchannel");
      if(/spanning-tree|\bstp\b|root\s+guard|bpdu/.test(x)) cats.add("stp");
      if(/ip\s+routing|ip\s+route|\brouting\b|network\s+\d/.test(x)) cats.add("routing");
      if(/\bqos\b|policy-map|class-map|service-policy/.test(x)) cats.add("qos");
      if(/\bvpn\b|crypto|ipsec|isakmp/.test(x)) cats.add("vpn");
      if(/\bntp\b|clock\s+set/.test(x)) cats.add("ntp");
      if(/\bssh\b|transport\s+input|aaa|tacacs|radius/.test(x)) cats.add("ssh");
      return cats;
    }

    function isPrivateIp(ip){
      if(!ip) return false;
      if(/^10\./.test(ip)) return true;
      if(/^192\.168\./.test(ip)) return true;
      const m = ip.match(/^172\.(\d+)\./);
      if(m){
        const n = parseInt(m[1], 10);
        if(n >= 16 && n <= 31) return true;
      }
      return false;
    }

    function extractPingIp(cmd){
      const m = String(cmd || "").match(/ping\s+([0-9.]+)/i);
      return m ? m[1] : "";
    }

    function diffCategory(device, match, fixedOut){
      const m = typeof match === "string" ? normalizeCmd(match) : String(match || "").toLowerCase();
      const fo = String(fixedOut || "").toLowerCase();

      if(m === "help" || m === "?") return "skip";
      if(m === "ipconfig" || m.includes("ipconfig")) return "dhcp";
      if(m.includes("dhcp")) return "dhcp";
      if(m.includes("interfaces trunk")) return "trunk";
      if(m.includes("ospf")) return "ospf";
      if(m.includes("eigrp")) return "eigrp";
      if(m.includes("bgp")) return "bgp";
      if(m.includes("standby") || m.includes("hsrp")) return "hsrp";
      if(m.includes("nat")) return "nat";
      if(m.includes("spanning-tree") || m.includes("stp")) return "stp";
      if(m.includes("etherchannel") || m.includes("port-channel")) return "etherchannel";
      if(m.includes("access-list") || m.includes("access-lists") || m.includes("access-group") || m.includes("vty") || m.startsWith("ssh ")) return "acl";
      if(m.includes("show ip route") || m === "show ip route" || m.includes("ip route")) return "routing";

      if(m.startsWith("ping ")){
        if(/blocked|deny|denied|acl|access/.test(fo)) return "acl";
        const ip = extractPingIp(m);
        if(ip && !isPrivateIp(ip)) return "internet";
        return "routing";
      }

      // PCs default to connectivity unless clearly ACL.
      if(/^pc/i.test(device)){
        if(/blocked|deny|denied|acl|access/.test(fo)) return "acl";
        return "routing";
      }
      return "generic";
    }

    function buildAutoProgress(){
      const stepIds = Object.keys(stepMap || {});
      if(stepIds.length === 0) return null;

      const cliDevices = (lab.cli && Array.isArray(lab.cli.devices)) ? lab.cli.devices : [];
      const defaultFixDev = cliDevices.find(d => !/^pc/i.test(d)) || cliDevices[0] || "";

      const stageMeta = stepIds.map((stepId, idx) => {
        const { title, device } = guessStepTitleAndDevice(stepId);
        const dev = (device && cliDevices.includes(device)) ? device : defaultFixDev;
        const lines = stepMap[stepId] || [];
        return {
          stepId,
          id: `auto-${stepId}`,
          title: title || `Fix step ${idx+1}`,
          device: dev,
          cats: stageCatsFromLines(lines, title),
        };
      });

      function stageMatchesCategory(stageCats, cat){
        if(stageCats.has(cat)) return true;
        // Practical bridging for real-world labs:
        if(cat === "dhcp" && (stageCats.has("trunk") || stageCats.has("routing"))) return true;
        if(cat === "internet" && (stageCats.has("nat") || stageCats.has("routing") || stageCats.has("dhcp") || stageCats.has("trunk"))) return true;
        if(cat === "routing" && (stageCats.has("ospf") || stageCats.has("eigrp") || stageCats.has("bgp"))) return true;
        if(cat === "ssh" && stageCats.has("acl")) return true;
        return false;
      }

      // Build a diff list between broken vs fixed for each device command.
      const fixed = (lab.cli && lab.cli.fixed) ? lab.cli.fixed : {};
      const broken = (lab.cli && lab.cli.broken) ? lab.cli.broken : {};

      function keyForMatch(x){
        if(typeof x === "string") return "s:" + normalizeCmd(x);
        if(x && x.re && x.re instanceof RegExp) return "r:" + x.re.source;
        return "";
      }

      function indexHandlers(map){
        const out = Object.create(null);
        for(const [dev, handlers] of Object.entries(map || {})){
          const idx = Object.create(null);
          for(const h of (handlers || [])){
            const k = keyForMatch(h.match);
            if(k) idx[k] = h.out;
          }
          out[dev] = idx;
        }
        return out;
      }

      const brokenIdx = indexHandlers(broken);

      const diffs = [];
      for(const [dev, handlers] of Object.entries(fixed)){
        for(const h of (handlers || [])){
          const cat = diffCategory(dev, h.match, h.out);
          if(cat === "skip") continue;
          const k = keyForMatch(h.match);
          const bo = (brokenIdx[dev] && k) ? brokenIdx[dev][k] : null;
          if(bo === null || bo === undefined || String(bo) !== String(h.out)){
            diffs.push({ dev, handler: h, category: cat, fixedOut: h.out });
          }
        }
      }

      // Assign diffs to stages based on category (and heuristics).
      const stageEffects = stageMeta.map(() => []);

      function chooseStageIndexForDiff(d){
        // Find earliest stage whose category set fits.
        for(let i=0;i<stageMeta.length;i++){
          if(stageMatchesCategory(stageMeta[i].cats, d.category)) return i;
        }
        // Prefer a stage that targets the same device (when not a PC).
        if(!/^pc/i.test(d.dev)){
          const j = stageMeta.findIndex(s => s.device === d.dev);
          if(j >= 0) return j;
        }
        // Default to last stage.
        return stageMeta.length - 1;
      }

      function toEffect(dev, match){
        const e = { device: dev, useMode: "fixed" };
        if(typeof match === "string") e.match = match;
        else if(match && match.re && match.re instanceof RegExp) e.matchRe = match.re.source;
        return e;
      }

      for(const d of diffs){
        const si = chooseStageIndexForDiff(d);
        stageEffects[si].push(toEffect(d.dev, d.handler.match));
      }

      // Special-case heuristic: if a later ACL stage blocks a ping, allow it to succeed
      // in the earliest non-ACL connectivity stage (so labs feel “real-world progressive”).
      for(const d of diffs){
        const isPing = typeof d.handler.match === "string" && normalizeCmd(d.handler.match).startsWith("ping ");
        if(!isPing) continue;
        const fo = String(d.fixedOut || "").toLowerCase();
        if(d.category !== "acl") continue;
        if(!/blocked|deny|denied|acl|access/.test(fo)) continue;
        const ip = extractPingIp(d.handler.match);
        if(!ip || !isPrivateIp(ip)) continue;

        const aclStage = chooseStageIndexForDiff(d);
        // Find earliest stage likely restoring connectivity (not ACL-focused).
        let early = -1;
        for(let i=0;i<stageMeta.length;i++){
          const cats = stageMeta[i].cats;
          if(i === aclStage) continue;
          if(cats.has("acl")) continue;
          if(cats.has("trunk") || cats.has("dhcp") || cats.has("routing") || cats.has("nat") || cats.has("ospf")){
            early = i;
            break;
          }
        }
        if(early >= 0){
          stageEffects[early].push({ device: d.dev, match: d.handler.match, action: "pingOk", ip });
        }
      }

      // De-dupe effects per stage.
      for(const arr of stageEffects){
        const seen = new Set();
        for(let i=arr.length-1;i>=0;i--){
          const e = arr[i];
          const k = `${e.device}|${e.match || ""}|${e.matchRe || ""}|${e.useMode || ""}|${e.action || ""}|${e.ip || ""}`;
          if(seen.has(k)) arr.splice(i, 1);
          else seen.add(k);
        }
      }

      return {
        autoSwitchFixedWhenComplete: true,
        stages: stageMeta.map((s, idx) => ({
          id: s.id,
          title: s.title,
          triggers: [{ step: s.stepId, device: s.device }],
          effects: stageEffects[idx],
        }))
      };
    }

    const progress = progressMeta || buildAutoProgress();

    const sim = {
      enabled: !!progress,
      seenGlobal: new Set(),
      seenByDevice: Object.create(null),
      stages: [],
      activeStageIds: new Set(),
    };

    function ensureDevSet(dev){
      if(!sim.seenByDevice[dev]) sim.seenByDevice[dev] = new Set();
      return sim.seenByDevice[dev];
    }

    function compileStages(){
      if(!progress || !Array.isArray(progress.stages)) return [];
      return progress.stages.map(s => {
        const stage = {
          id: s.id,
          title: s.title || s.id,
          triggers: Array.isArray(s.triggers) ? s.triggers : [],
          requires: Array.isArray(s.requires) ? s.requires : [],
          effects: Array.isArray(s.effects) ? s.effects.map(e => {
            const x = Object.assign({}, e);
            if(typeof x.matchRe === "string"){
              try{ x._re = new RegExp(x.matchRe, "i"); }catch(_){ x._re = null; }
            }
            return x;
          }) : [],
          _active: false,
        };
        return stage;
      });
    }

    sim.stages = compileStages();

    function recordFixLine(device, cmd){
      if(!sim.enabled) return;
      const vars = canonFixLineVariants(cmd);
      for(const n of vars){
        if(isGenericFixLine(n)) continue;
        sim.seenGlobal.add(n);
        ensureDevSet(device).add(n);
      }
    }

    function stepApplied(stepId, device){
      const lines = stepMap[stepId] || [];
      if(lines.length === 0) return false;
      const pool = device ? ensureDevSet(device) : sim.seenGlobal;
      return lines.every(l => pool.has(l));
    }

    function stageSatisfied(stage){
      // triggers: {step:"sw1fix1"} or {step:"sw1fix1", device:"SW1"}
      for(const t of stage.triggers){
        if(t && t.step){
          if(!stepApplied(t.step, t.device)) return false;
        }
      }
      // requires: {device:"R1", cmds:["ip access-group 100 in", ...]}
      for(const r of stage.requires){
        if(!r || !r.device || !Array.isArray(r.cmds)) continue;
        const pool = ensureDevSet(r.device);
        for(const c of r.cmds){
          const n = normFixLine(c);
          if(n && !pool.has(n)) return false;
        }
      }
      return true;
    }

    function allStagesActive(){
      return sim.stages.length > 0 && sim.stages.every(s => s._active);
    }

    function maybeActivateStages(){
      if(!sim.enabled) return;
      for(const stage of sim.stages){
        if(stage._active) continue;
        if(stageSatisfied(stage)){
          stage._active = true;
          sim.activeStageIds.add(stage.id);
          append(`% AutoFix: stage unlocked: ${stage.title}`);
        }
      }
      if(progress && progress.autoSwitchFixedWhenComplete && allStagesActive()){
        if((modeSel.value || "").toLowerCase() !== "fixed"){
          modeSel.value = "Fixed";
          append("% ✅ AutoFix: all stages complete. Switching simulation mode to Fixed.");
        }
      }
    

      // publish progress for topology indicators
      try{
        const reg = window.__ITSDaksSim || (window.__ITSDaksSim = Object.create(null));
        reg[lab.id] = {
          enabled: sim.enabled,
          activeStageIds: Array.from(sim.activeStageIds),
          stages: sim.stages.map(s => ({ id: s.id, title: s.title, requires: s.requires, active: !!s._active }))
        };
        window.dispatchEvent(new CustomEvent('itsdaks:progress', { detail: { labId: lab.id, activeStageIds: Array.from(sim.activeStageIds), stageCount: sim.stages.length } }));
      }catch(_){ /* ignore */ }
    }

    function stageProgressLine(){
      if(!sim.enabled) return "AutoFix: off";
      const a = Array.from(sim.activeStageIds).length;
      const t = sim.stages.length;
      return `AutoFix: ${a}/${t} stages`;
    }

    function prompt(){
      const d = deviceSel.value;
      if(d.startsWith("PC")) return `${d}>`;
      const ctx = ctxByDevice[d] || { mode: "exec" };
      if(ctx.mode === "config") return `${d}(config)#`;
      if(ctx.mode === "config-if") return `${d}(config-if)#`;
      if(ctx.mode === "config-router") return `${d}(config-router)#`;
      if(ctx.mode === "config-acl") return `${d}(config-ext-nacl)#`;
      return `${d}#`;
    }

    function append(text){
      outEl.textContent += text + "\n";
      outEl.scrollTop = outEl.scrollHeight;
    }

    function seed(){
      outEl.textContent = "";
      append("=== Real-World Net Sim Console ===");
      append(`Lab: ${lab.title}`);
      append(`Device: ${deviceSel.value} • Mode: ${modeSel.value}`);
      append(stageProgressLine());
      append('Type "help" for supported commands.');
      append("");
    }

    function handlerOutput(modeKey, device, cmd){
      const handlers = lab.cli && lab.cli[modeKey] && lab.cli[modeKey][device] ? lab.cli[modeKey][device] : [];
      const norm = normalizeCmd(cmd);
      const dyn = dynamicCliOutput(lab, net, modeKey, device, cmd);
      if(dyn != null) return dyn;
      for(const h of handlers){
        if(typeof h.match === "string"){
          if(norm === normalizeCmd(h.match)) return h.out;
        } else if(h.match && h.match.re){
          if(h.match.re.test(cmd)) return h.out;
        }
      }
      return null;
    }

    function effectMatches(effect, device, cmd){
      if(effect.device && effect.device !== device) return false;
      if(effect.match){
        return normalizeCmd(cmd) === normalizeCmd(effect.match);
      }
      if(effect._re){
        return effect._re.test(cmd);
      }
      return false;
    }

    function progressOverride(device, cmd){
      if(!sim.enabled) return null;
      if((modeSel.value || "").toLowerCase() === "fixed") return null;

      let chosen = null;
      for(const stage of sim.stages){
        if(!stage._active) continue;
        for(const e of stage.effects){
          if(effectMatches(e, device, cmd)) chosen = e;
        }
      }
      if(!chosen) return null;

      if(chosen.useMode){
        return handlerOutput(String(chosen.useMode).toLowerCase(), device, cmd);
      }
      if(chosen.output){
        return chosen.output;
      }
      if(chosen.action === "pingOk"){
        return pingOk(chosen.ip || "0.0.0.0");
      }
      if(chosen.action === "pingFail"){
        return pingFail(chosen.ip || "0.0.0.0", chosen.hint || "");
      }
      return null;
    }

    function handleConfigMode(device, cmd){
      if(device.startsWith("PC")) return null;
      // normalize common shorthands (int, conf t, no shut, etc.)
      const v = canonFixLineVariants(cmd)[0] || normFixLine(cmd);
      const c = v;
      if(!ctxByDevice[device]) ctxByDevice[device] = { mode: "exec" };
      const ctx = ctxByDevice[device];

      if(c === "conf t" || c === "configure terminal"){
        ctx.mode = "config";
        return "Enter configuration commands, one per line. End with CNTL/Z.";
      }
      if(c === "end"){
        ctx.mode = "exec";
        ctx.iface = "";
        return "";
      }
      if(c === "exit"){
        if(ctx.mode === "exec") return "";
        ctx.mode = "exec";
        ctx.iface = "";
        return "";
      }
      if(c.startsWith("interface ")){ ctx.mode = "config-if"; ctx.iface = canonIfName(c.split(/\s+/)[1]||""); ensureIface(net, device, ctx.iface); computeLinkStates(lab, net); dispatchNetEvent(lab.id); return ""; }
      if(c.startsWith("router ")){ ctx.mode = "config-router"; return ""; }
      if(c.startsWith("ip access-list ")){ ctx.mode = "config-acl"; return ""; }
      return null;
    }

    function maybeAcceptConfigNoise(device, cmd){
      if(device.startsWith("PC")) return null;
      const c = normFixLine(cmd);

      // Packet Tracer-ish: in config modes, reject obvious exec-only commands
      const ctx = ctxByDevice[device] || { mode: 'exec', iface: '' };
      ctx.iface = ctx.iface || '';
      ctxByDevice[device] = ctx;

      // Live net parsing for interface-level commands (admin shut/no shut, trunk allow, dot1q)
      // Only applies when we are in interface context
      const expanded = (function(){
        const raw = String(cmd||"").trim();
        const toks = rawTokens(raw.toLowerCase());
        if(toks.length === 0) return raw;

        // shutdown shortcuts
        if(toks[0] === "shut") return "shutdown";
        if(toks[0] === "shutdown") return "shutdown";
        if(toks[0] === "no" && (toks[1] === "shut" || toks[1] === "shutdown" || toks[1] === "sh")) return "no shutdown";

        // switchport trunk allowed vlan (sw tr al vl ...)
        const canon4 = ["switchport","trunk","allowed","vlan"];
        if(toks.length >= 4){
          let ok = true;
          for(let i=0;i<4;i++){
            if(!tokenPrefixMatch(toks[i], canon4[i])){ ok = false; break; }
          }
          if(ok){
            const rest = raw.split(/\s+/).slice(4).join(" ");
            return "switchport trunk allowed vlan " + rest.trim();
          }
        }

        // switchport mode trunk (sw mo tr ...)
        const canon3 = ["switchport","mode","trunk"];
        if(toks.length >= 3){
          let ok = true;
          for(let i=0;i<3;i++){
            if(!tokenPrefixMatch(toks[i], canon3[i])){ ok = false; break; }
          }
          if(ok) return "switchport mode trunk";
        }

        // encapsulation dot1q X
        if(toks.length >= 3 && tokenPrefixMatch(toks[0], "encapsulation") && tokenPrefixMatch(toks[1], "dot1q")){
          return "encapsulation dot1Q " + toks[2];
        }
        if(toks.length >= 3 && toks[0] === "enc" && tokenPrefixMatch(toks[1], "dot1q")){
          return "encapsulation dot1Q " + toks[2];
        }

        return raw;
      })();

      if(ctx.mode && ctx.mode !== 'exec'){
        if(/^(reload|dir|delete|erase|clear)\b/i.test(c)){
          return null; // let resolver produce IOS-style error
        }
      }

      // Apply interface-level changes to net
      let netChanged = false;
      if(ctx.mode === 'config-if' && ctx.iface){
        const st = ensureIface(net, device, ctx.iface);
        const low = expanded.toLowerCase().trim();

        if(low === "shutdown"){
          if(st && st.adminUp !== false){ st.adminUp = false; netChanged = true; }
        }
        if(low === "no shutdown"){
          if(st && st.adminUp !== true){ st.adminUp = true; netChanged = true; }
        }

        if(/^switchport\s+mode\s+trunk$/i.test(low)){
          if(st && st.trunkMode !== true){ st.trunkMode = true; netChanged = true; }
        }

        const mAl = low.match(/^switchport\s+trunk\s+allowed\s+vlan\s+(.+)$/i);
        if(mAl){
          const s = (mAl[1]||"").trim();
          if(/^all$/i.test(s)){
            if(st && st.allowedVlans !== null){ st.allowedVlans = null; netChanged = true; }
          }else{
            const set = parseVlanList(s);
            const prev = st && st.allowedVlans;
            let diff = true;
            if(prev instanceof Set && prev.size === set.size){
              diff = false;
              for(const v of set){ if(!prev.has(v)){ diff = true; break; } }
            }
            if(st && (st.allowedVlans === null || diff)){
              st.allowedVlans = set;
              netChanged = true;
            }
          }
        }

        const mEnc = low.match(/^encapsulation\s+dot1q\s+(\d+)/i);
        if(mEnc){
          const vlan = parseInt(mEnc[1],10);
          const parent = canonIfShort(String(ctx.iface).split(".")[0]);
          net.dot1qReq[device] = net.dot1qReq[device] || Object.create(null);
          net.dot1qReq[device][parent] = net.dot1qReq[device][parent] || new Set();
          const before = net.dot1qReq[device][parent].size;
          if(isFinite(vlan)) net.dot1qReq[device][parent].add(vlan);
          if(net.dot1qReq[device][parent].size !== before) netChanged = true;
        }
      }

      if(netChanged){
        computeLinkStates(lab, net);
        dispatchNetEvent(lab.id);
      }

      if(c === "wr mem" || c === "write mem" || c === "write memory"){
        return "Building configuration...\n[OK]";
      }
      // If it is not a show/ping/help/ipconfig, accept silently to allow pasting solutions
      const low = c;
      if(low.startsWith("show ") || low.startsWith("ping ")) return null;
      if(low.startsWith("ping ") || low === "help" || low === "?" || low === "ipconfig") return null;
      if(low.startsWith("traceroute ")) return null;
      return "";
    }

    function runOneLine(line){
      const cmd = String(line || "").trim();
      if(!cmd) return;

      const device = deviceSel.value;

      append(`${prompt()} ${cmd}`);

      // Track fix commands for progress
      recordFixLine(device, cmd);

      // Activate stages if possible
      maybeActivateStages();

      // Progress-based override (partial fix)
      const ov = progressOverride(device, cmd);
      if(ov !== null && ov !== undefined){
        if(String(ov).length) append(ov);
        append("");
        return;
      }

      // Config mode & accept config lines (so "conf t" doesn't error)
      const configOut = handleConfigMode(device, cmd);
      if(configOut !== null){
        if(String(configOut).length) append(configOut);
        promptEl.textContent = prompt();
        append("");
        return;
      }
      const accept = maybeAcceptConfigNoise(device, cmd);
      if(accept !== null){
        if(String(accept).length) append(accept);
        append("");
        return;
      }

      // Packet Tracer-ish command resolution (abbrev + IOS errors)
      const ctx = ctxByDevice[device] || { mode: 'exec' };
      const r = resolveCommand(device, cmd);

      if(r.kind === 'help'){
        showHelp(device, r.prefix);
        return;
      }

      if(r.kind === 'out'){
        if(String(r.out).length) append(r.out);
        append("");
        return;
      }

      // In config modes (simplified): allow show/ping/traceroute; config lines are accepted earlier.
      if(r.kind === 'incomplete'){
        append(iosError(cmd, 'incomplete'));
      } else if(r.kind === 'ambiguous'){
        append(iosError(cmd, 'ambiguous'));
      } else {
        append(iosError(cmd, 'invalid'));
      }
      append("");
    }

    function run(){
      const raw = inEl.value || "";
      if(!raw.trim()) return;
      inEl.value = "";

      // Multi-line paste support
      const lines = raw.split(/\r?\n/);
      for(const l of lines) runOneLine(l);
    }

    deviceSel.addEventListener("change", () => {
      promptEl.textContent = prompt();
      seed();
    });
    modeSel.addEventListener("change", () => seed());

    runBtn.addEventListener("click", () => {
      const val = inEl.value || "";
      if(val.trim()){
        hist.push(val);
        if(hist.length > 200) hist.shift();
        histIdx = hist.length;
      }
      run();
    });
    clearBtn.addEventListener("click", () => seed());

    inEl.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){
        e.preventDefault();
        const val = inEl.value || "";
        if(val.trim()){
          hist.push(val);
          if(hist.length > 200) hist.shift();
          histIdx = hist.length;
        }
        run();
        return;
      }

      if(e.key === "ArrowUp"){
        e.preventDefault();
        if(hist.length === 0) return;
        histIdx = Math.max(0, (histIdx < 0 ? hist.length-1 : histIdx-1));
        inEl.value = hist[histIdx] || "";
        return;
      }

      if(e.key === "ArrowDown"){
        e.preventDefault();
        if(hist.length === 0) return;
        histIdx = Math.min(hist.length, (histIdx < 0 ? hist.length : histIdx+1));
        inEl.value = (histIdx >= hist.length) ? "" : (hist[histIdx] || "");
        return;
      }

      if(e.key === "Tab"){
        e.preventDefault();
        const device = deviceSel.value;
        const res = tabComplete(device, inEl.value);
        if(res && typeof res.value === 'string') inEl.value = res.value;
        if(res && Array.isArray(res.options) && res.options.length){
          append('');
          append(res.options.slice(0, 40).join('  '));
          if(res.options.length > 40) append(`... (${res.options.length-40} more)`);
          append('');
        }
        return;
      }
    });

    promptEl.textContent = prompt();
    seed();
    inEl.focus();
  }



  /* ---------------------------
     Configs tab
     --------------------------- */

  function renderConfigsTab(lab){
    const entries = Object.entries(lab.startingConfigs || {});
    return `
      <div class="notice small">
        These are the <b>starting configs</b> (what you’d see in a simulator). Keep the Solution tab hidden while you troubleshoot.
      </div>

      <hr class="sep" />

      ${entries.map(([name, cfg], idx) => `
        <h3 style="margin:0 0 8px 0;">${escapeHtml(name)}</h3>
        <div class="codeblock">
          <button class="copy-btn" data-copy="cfg_${idx}">Copy</button>
          <pre><code id="cfg_${idx}">${escapeHtml(cfg)}</code></pre>
        </div>
        <hr class="sep" />
      `).join("")}
    `;
  }

  function bindCopyButtons(root){
    qsa("[data-copy]", root).forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-copy");
        const codeEl = byId(id) || qs("#"+CSS.escape(id), root);
        if(!codeEl) return;
        const text = codeEl.textContent;

        try{
          await navigator.clipboard.writeText(text);
          toast("Copied to clipboard");
        }catch(e){
          toast("Clipboard blocked by browser");
        }
      });
    });
  }

  /* ---------------------------
     About page
     --------------------------- */

  function renderAbout(){
    const view = byId("view");
    view.innerHTML = `
      <div class="panel">
        <div class="panel-hd">
          <div>
            <h2 class="panel-title" style="margin:0;">About this site</h2>
            <div class="panel-sub">A lightweight, browser-only lab library for CCNA & CCNP style troubleshooting.</div>
          </div>
        </div>
        <div class="panel-bd">
          <div class="split">
            <div>
              <h3 style="margin:0 0 6px 0;">What this is</h3>
              <ul class="clean">
                <li>A <b>static website</b> that contains “real-world” style problems.</li>
                <li>Each lab has a <b>Problem</b> section and a <b>separate</b> <b>Solution</b> section.</li>
                <li>A simple <b>Console</b> lets you run common <span class="kbd">show</span> and <span class="kbd">ping</span> commands.</li>
              </ul>

              <h3 style="margin:14px 0 6px 0;">What this is not</h3>
              <ul class="clean">
                <li>Not a full IOS emulator (config mode is simulated; it accepts commands but doesn’t truly emulate IOS).</li>
                <li>For full practice, take the provided configs and build the topology in Packet Tracer, CML, or GNS3.</li>
              </ul>
            </div>

            <div>
              <h3 style="margin:0 0 6px 0;">How to add more labs</h3>
              <ol class="clean">
                <li>Open <span class="kbd">assets/labs.js</span></li>
                <li>Duplicate one of the objects inside <span class="kbd">window.ITSDaksLabs</span></li>
                <li>Edit: title, topology nodes/links, problemHtml, solutionHtml, and the console outputs</li>
                <li>(Optional) Add <span class="kbd">cli.progress</span> stages for progressive fixes — or let the site auto-generate them from your Solution steps.</li>
              </ol>

              <div class="notice small" style="margin-top:12px;">
                If you want, I can generate <b>10–30 more labs</b> (mix of CCNA/CCNP) with
                realistic configs and troubleshooting outputs—VTP/STP, EtherChannel, OSPF/EIGRP/BGP,
                NAT, ACLs, IPsec/DMVPN, QoS, multicast, etc.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------------------------
     Toast (tiny)
     --------------------------- */

  let toastTimer = null;
  function toast(msg){
    let el = qs("#toast");
    if(!el){
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "20px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 12px";
      el.style.border = "1px solid rgba(255,255,255,0.16)";
      el.style.background = "rgba(0,0,0,0.45)";
      el.style.backdropFilter = "blur(10px)";
      el.style.borderRadius = "14px";
      el.style.color = "rgba(255,255,255,0.92)";
      el.style.boxShadow = "0 18px 50px rgba(0,0,0,0.35)";
      el.style.zIndex = "999";
      el.style.fontSize = "13px";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.opacity = "0";
    }, 1400);
  }

  /* ---------------------------
     Routing
     --------------------------- */

  let lastListRoute = "home";

  function renderRoute(route){
    setActiveNav(route);

    const search = byId("searchInput").value || "";
    const difficulty = byId("difficultyFilter").value || "";

    if(route === "home"){
      setToolbar("Home", "Browse labs");
      lastListRoute = "home";
      renderLabList(route, filterLabs({ q: search, difficulty }));
      return;
    }

    if(route.startsWith("track/")){
      const track = route.split("/")[1];
      setToolbar(track, `Labs for ${track}`);
      lastListRoute = route;
      renderLabList(route, filterLabs({ track, q: search, difficulty }));
      return;
    }

    if(route.startsWith("lab/")){
      const id = route.split("/")[1];
      const lab = LABS.find(l => l.id === id);
      setToolbar(lab ? lab.track : "Lab", lab ? lab.title : "Lab not found");
      renderLab(lab);
      return;
    }

    if(route === "about"){
      setToolbar("About", "How this works");
      lastListRoute = "home";
      renderAbout();
      return;
    }

    // fallback
    setToolbar("Home", "Browse labs");
    renderLabList("home", filterLabs({ q: search, difficulty }));
  }

  /* ---------------------------
     Boot
     --------------------------- */

  function boot(){
    // nav buttons
    qsa(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        routeToHash(btn.getAttribute("data-route"));
      });
    });

    // search / filter
    byId("searchInput").addEventListener("input", () => renderRoute(getRouteFromHash()));
    byId("difficultyFilter").addEventListener("change", () => renderRoute(getRouteFromHash()));

    window.addEventListener("hashchange", () => renderRoute(getRouteFromHash()));

    // default route
    if(!location.hash) location.hash = "#home";
    renderRoute(getRouteFromHash());
  }

  boot();
})();