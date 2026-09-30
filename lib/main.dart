import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const QuickCutAI());
}

class QuickCutAI extends StatelessWidget {
  const QuickCutAI({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QuickCut AI',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0D0D12),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final List<PlatformFile> videos = [];
  final List<PlatformFile> photos = [];

  PlatformFile? music;

  String selectedStyle = 'Fast';
  String selectedRatio = '9:16';

  final TextEditingController instructionController =
      TextEditingController();

  bool processing = false;
  double progress = 0;

  // AI SERVER MANZILI
  //
  // Keyinchalik o'zingning AI backend manzilingni shu yerga yozamiz.
  // Masalan:
  // https://your-server.com
  static const String serverUrl = 'https://YOUR-AI-SERVER.com';

  @override
  void dispose() {
    instructionController.dispose();
    super.dispose();
  }

  Future<void> addVideos() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.video,
      allowMultiple: true,
    );

    if (result != null) {
      setState(() {
        videos.addAll(result.files);
      });
    }
  }

  Future<void> addPhotos() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: true,
    );

    if (result != null) {
      setState(() {
        photos.addAll(result.files);
      });
    }
  }

  Future<void> addMusic() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.audio,
      allowMultiple: false,
    );

    if (result != null && result.files.isNotEmpty) {
      setState(() {
        music = result.files.first;
      });
    }
  }

  Future<void> createAIVideo() async {
    if (videos.isEmpty && photos.isEmpty) {
      showMessage('Avval video yoki rasm tanlang.');
      return;
    }

    if (instructionController.text.trim().isEmpty) {
      showMessage(
        'AI ga videoni qanday montaj qilish kerakligini yozing.',
      );
      return;
    }

    setState(() {
      processing = true;
      progress = 0.05;
    });

    try {
      final uri = Uri.parse('$serverUrl/api/v1/montage');

      final request = http.MultipartRequest('POST', uri);

      request.fields['style'] = selectedStyle;
      request.fields['aspect_ratio'] = selectedRatio;
      request.fields['instruction'] =
          instructionController.text.trim();

      for (final video in videos) {
        if (video.path != null) {
          request.files.add(
            await http.MultipartFile.fromPath(
              'videos',
              video.path!,
              filename: video.name,
            ),
          );
        }
      }

      for (final photo in photos) {
        if (photo.path != null) {
          request.files.add(
            await http.MultipartFile.fromPath(
              'photos',
              photo.path!,
              filename: photo.name,
            ),
          );
        }
      }

      if (music != null && music!.path != null) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'music',
            music!.path!,
            filename: music!.name,
          ),
        );
      }

      setState(() {
        progress = 0.25;
      });

      final response = await request.send();

      setState(() {
        progress = 0.75;
      });

      final responseText = await response.stream.bytesToString();

      if (!mounted) return;

      if (response.statusCode >= 200 &&
          response.statusCode < 300) {
        setState(() {
          progress = 1.0;
          processing = false;
        });

        String message = 'AI montaj boshlandi.';

        try {
          final data = jsonDecode(responseText);

          if (data is Map && data['message'] != null) {
            message = data['message'].toString();
          }
        } catch (_) {}

        showMessage(message);
      } else {
        setState(() {
          processing = false;
        });

        showMessage(
          'AI server xatosi: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        processing = false;
      });

      showMessage(
        'Serverga ulanib bo‘lmadi. AI server manzilini tekshiring.',
      );
    }
  }

  void showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Widget menuButton(
    String title,
    IconData icon,
    VoidCallback onPressed,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: const Color(0xFF191923),
      child: ListTile(
        leading: Icon(
          icon,
          color: Colors.deepPurpleAccent,
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: onPressed,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'QuickCut AI',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 10),

            const Text(
              'Upload. AI Edits. You Create.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              'Videolaringizni yuklang. Qolganini AI qiladi.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 15,
              ),
            ),

            const SizedBox(height: 28),

            SizedBox(
              height: 58,
              child: FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.auto_awesome),
                label: const Text(
                  'CREATE AI VIDEO',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            menuButton(
              'Quick Montage',
              Icons.flash_on,
              () {},
            ),

            menuButton(
              'Music Sync',
              Icons.music_note,
              () {},
            ),

            menuButton(
              'Meme Video',
              Icons.sentiment_very_satisfied,
              () {},
            ),

            menuButton(
              'Gaming',
              Icons.sports_esports,
              () {},
            ),

            menuButton(
              'My Projects',
              Icons.folder,
              () {},
            ),

            menuButton(
              'Templates',
              Icons.video_library,
              () {}, 
            ),

            const SizedBox(height: 20),

            const Divider(),

            const SizedBox(height: 20),

            const Text(
              'AI VIDEO MONTAGE',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            OutlinedButton.icon(
              onPressed: addVideos,
              icon: const Icon(Icons.video_file),
              label: Text(
                videos.isEmpty
                    ? 'Add Videos'
                    : 'Videos: ${videos.length}',
              ),
            ),

            const SizedBox(height: 10),

            OutlinedButton.icon(
              onPressed: addPhotos,
              icon: const Icon(Icons.photo),
              label: Text(
                photos.isEmpty
                    ? 'Add Photos'
                    : 'Photos: ${photos.length}',
              ),
            ),

            const SizedBox(height: 10),

            OutlinedButton.icon(
              onPressed: addMusic,
              icon: const Icon(Icons.music_note),
              label: Text(
                music == null
                    ? 'Add Music'
                    : 'Music: ${music!.name}',
              ),
            ),

            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              initialValue: selectedStyle,
              decoration: const InputDecoration(
                labelText: 'AI Style',
                border: OutlineInputBorder(),
              ),
              items: const [
                'Fast',
                'Cinematic',
                'Gaming',
                'Funny',
                'Meme',
                'Beat Sync',
                'Smooth',
                'Shorts',
                'Dramatic',
                'Minimal',
              ]
                  .map(
                    (style) => DropdownMenuItem(
                      value: style,
                      child: Text(style),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    selectedStyle = value;
                  });
                }
              },
            ),

            const SizedBox(height: 12),

            DropdownButtonFormField<String>(
              initialValue: selectedRatio,
              decoration: const InputDecoration(
                labelText: 'Aspect Ratio',
                border: OutlineInputBorder(),
              ),
              items: const [
                '9:16',
                '16:9',
                '1:1',
                '4:5',
              ]
                  .map(
                    (ratio) => DropdownMenuItem(
                      value: ratio,
                      child: Text(ratio),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    selectedRatio = value;
                  });
                }
              },
            ),

            const SizedBox(height: 16),

            TextField(
              controller: instructionController,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'AI ga montaj topshirig‘ini yozing',
                hintText:
                    'Masalan: Videoni tez va ritmik montaj qil. Eng qiziqarli joylarni tanla, musiqaga beat sync qil, zoom va transition qo‘sh. Shorts formatida qil.',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
            ),

            const SizedBox(height: 20),

            if (processing) ...[
              const Text(
                'AI video ustida ishlayapti...',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              LinearProgressIndicator(value: progress),
              const SizedBox(height: 20),
            ],

            SizedBox(
              height: 58,
              child: FilledButton.icon(
                onPressed:
                    processing ? null : createAIVideo,
                icon: const Icon(Icons.auto_awesome),
                label: Text(
                  processing
                      ? 'AI ISHLAYAPTI...'
                      : 'AI MONTAGE',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),

            const Text(
              'QuickCut AI 1.0.0',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
