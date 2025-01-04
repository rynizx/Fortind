import SwiftUI

@main
struct SidebarApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        NavigationView {
            Sidebar()
            MainContent()
        }
    }
}

struct Sidebar: View {
    var body: some View {
        List {
            NavigationLink(destination: Text("Home")) {
                Label("Home", systemImage: "house")
            }
            NavigationLink(destination: Text("Settings")) {
                Label("Settings", systemImage: "gear")
            }
        }
        .listStyle(SidebarListStyle())
        .navigationTitle("Menu")
    }
}

struct MainContent: View {
    var body: some View {
        Text("Select an item from the sidebar")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.gray.opacity(0.1))
            .navigationTitle("Main Content")
    }
}
struct TopNavBar: View {
    var body: some View {
        HStack {
            Button(action: {
                // Action for the button
            }) {
                Image(systemName: "bell")
            }
            Spacer()
            Text("Top Navigation Bar")
                .font(.headline)
            Spacer()
            Button(action: {
                // Action for the button
            }) {
                Image(systemName: "person.crop.circle")
            }
        }
        .padding()
        .background(Color.blue)
        .foregroundColor(.white)
    }
}

struct ContentView: View {
    var body: some View {
        VStack {
            TopNavBar()
            Divider()
            NavigationView {
                Sidebar()
                MainContent()
            }
        }
    }
}